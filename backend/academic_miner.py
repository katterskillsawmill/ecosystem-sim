"""
AcademicResearchMiner — structured, throttled research miner (compute microservice).

Quality bar vs AGY spam loop:
- Parse real arXiv Atom titles/ids/summaries
- One rolling report per topic per day (not 1000 near-duplicate MD files)
- Structured JSONL for downstream gem review
- No zero-vector Qdrant upserts (disabled unless real embeddings provided)
- Rate-limited: default max N audits per hour
"""
from __future__ import annotations

import datetime
import json
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Prefer compose volume path; fall back to repo-local reports/
_DEFAULT_REPORTS = os.environ.get(
    "SIM_REPORTS_DIR",
    "/root/ecosystems/reports" if os.path.isdir("/root/ecosystems/reports") else str(Path(__file__).resolve().parent.parent / "reports"),
)
REPORTS_DIR = Path(_DEFAULT_REPORTS)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

JSONL_PATH = REPORTS_DIR / "miner-structured.jsonl"
STATE_PATH = REPORTS_DIR / ".miner-state.json"

# Max full audits per hour (worker loop must respect this)
MAX_AUDITS_PER_HOUR = int(os.environ.get("MINER_MAX_AUDITS_PER_HOUR", "12"))
# Min seconds between audits
MIN_INTERVAL_SEC = int(os.environ.get("MINER_MIN_INTERVAL_SEC", "300"))


def _load_state() -> dict[str, Any]:
    if STATE_PATH.exists():
        try:
            return json.loads(STATE_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save_state(state: dict[str, Any]) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2), encoding="utf-8")


def _throttle_ok() -> tuple[bool, str]:
    state = _load_state()
    now = time.time()
    last = float(state.get("last_audit_ts", 0))
    if now - last < MIN_INTERVAL_SEC:
        return False, f"min_interval {MIN_INTERVAL_SEC}s not elapsed (wait {int(MIN_INTERVAL_SEC - (now - last))}s)"
    hour_key = datetime.datetime.utcnow().strftime("%Y%m%d%H")
    if state.get("hour_key") != hour_key:
        state["hour_key"] = hour_key
        state["hour_count"] = 0
    if int(state.get("hour_count", 0)) >= MAX_AUDITS_PER_HOUR:
        return False, f"hourly cap {MAX_AUDITS_PER_HOUR} reached"
    return True, "ok"


def _record_audit() -> None:
    state = _load_state()
    now = time.time()
    hour_key = datetime.datetime.utcnow().strftime("%Y%m%d%H")
    if state.get("hour_key") != hour_key:
        state["hour_key"] = hour_key
        state["hour_count"] = 0
    state["hour_count"] = int(state.get("hour_count", 0)) + 1
    state["last_audit_ts"] = now
    _save_state(state)


def _http_get(url: str, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "DCoop-ecosystem-sim-miner/1.1"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


class AcademicResearchMiner:
    """
    ACT/OBSERVE: Fetches open-source code, models, and academic research
    from ArXiv, Zenodo, GitHub, and HuggingFace — structured + throttled.
    """

    def fetch_arxiv_papers(self, query: str = "multi-agent simulation", max_results: int = 5) -> list[dict[str, str]]:
        print(f"[ACADEMIC MINER] Querying ArXiv API for: {query}")
        try:
            url = (
                "http://export.arxiv.org/api/query?"
                f"search_query=all:{urllib.parse.quote(query)}&start=0&max_results={max_results}"
            )
            data = _http_get(url)
            root = ET.fromstring(data)
            ns = {"a": "http://www.w3.org/2005/Atom"}
            papers: list[dict[str, str]] = []
            for entry in root.findall("a:entry", ns):
                title = (entry.findtext("a:title", default="", namespaces=ns) or "").strip().replace("\n", " ")
                summary = (entry.findtext("a:summary", default="", namespaces=ns) or "").strip()
                summary = re.sub(r"\s+", " ", summary)[:500]
                link = entry.findtext("a:id", default="", namespaces=ns) or ""
                papers.append({"title": title, "summary": summary, "url": link, "source": "arxiv"})
            return papers
        except Exception as e:
            print(f"[ACADEMIC MINER] ArXiv error: {e}")
            return [{"error": str(e), "source": "arxiv"}]

    def fetch_cern_research(self, query: str = "WebAssembly edge", max_results: int = 3) -> list[dict[str, str]]:
        print(f"[ACADEMIC MINER] Querying Zenodo for: {query}")
        try:
            url = f"https://zenodo.org/api/records?q={urllib.parse.quote(query)}&size={max_results}"
            data = json.loads(_http_get(url).decode("utf-8"))
            out: list[dict[str, str]] = []
            for hit in data.get("hits", {}).get("hits", []):
                meta = hit.get("metadata", {})
                out.append(
                    {
                        "title": meta.get("title", "Unknown"),
                        "url": hit.get("links", {}).get("html", ""),
                        "source": "zenodo",
                    }
                )
            return out
        except Exception as e:
            print(f"[ACADEMIC MINER] Zenodo error: {e}")
            return [{"error": str(e), "source": "zenodo"}]

    def fetch_github_repos(self, query: str = "digital twin simulation", max_results: int = 5) -> list[dict[str, Any]]:
        print(f"[ACADEMIC MINER] Querying GitHub for: {query}")
        try:
            url = f"https://api.github.com/search/repositories?q={urllib.parse.quote(query)}&per_page={max_results}&sort=stars"
            headers = {"User-Agent": "DCoop-ecosystem-sim-miner/1.1"}
            token = os.getenv("GITHUB_PAT") or os.getenv("GITHUB_TOKEN")
            if token:
                headers["Authorization"] = f"Bearer {token}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            repos = []
            for repo in data.get("items", []):
                repos.append(
                    {
                        "full_name": repo.get("full_name"),
                        "stars": repo.get("stargazers_count"),
                        "description": (repo.get("description") or "")[:300],
                        "url": repo.get("html_url"),
                        "source": "github",
                    }
                )
            return repos
        except Exception as e:
            print(f"[ACADEMIC MINER] GitHub error: {e}")
            return [{"error": str(e), "source": "github"}]

    def fetch_huggingface_models(self, query: str = "agent", max_results: int = 5) -> list[dict[str, str]]:
        print(f"[ACADEMIC MINER] Querying HuggingFace for: {query}")
        try:
            url = f"https://huggingface.co/api/models?search={urllib.parse.quote(query)}&limit={max_results}"
            data = json.loads(_http_get(url).decode("utf-8"))
            return [
                {
                    "modelId": m.get("modelId", ""),
                    "url": f"https://huggingface.co/{m.get('modelId', '')}",
                    "source": "huggingface",
                }
                for m in data
            ]
        except Exception as e:
            print(f"[ACADEMIC MINER] HF error: {e}")
            return [{"error": str(e), "source": "huggingface"}]

    def _slug(self, name: str) -> str:
        return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")[:80]

    def _append_jsonl(self, record: dict[str, Any]) -> None:
        with JSONL_PATH.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    def execute_red_team_audit(self, target_ecosystem: str, force: bool = False) -> str:
        """Throttled structured audit. Writes daily rolling MD + JSONL. Returns path or skip notice."""
        print(f"\n--- [RED TEAM AUDIT] {target_ecosystem} ---")
        if not force:
            ok, reason = _throttle_ok()
            if not ok:
                msg = f"[THROTTLE] skip audit for {target_ecosystem}: {reason}"
                print(msg)
                return msg

        arxiv = self.fetch_arxiv_papers(query=f"{target_ecosystem} simulation AI")
        zenodo = self.fetch_cern_research(query=target_ecosystem)
        github = self.fetch_github_repos(query=f"{target_ecosystem} open source")
        hf = self.fetch_huggingface_models(query=target_ecosystem.split()[0] if target_ecosystem else "agent")

        ts = datetime.datetime.utcnow().isoformat() + "Z"
        payload = {
            "target": target_ecosystem,
            "timestamp": ts,
            "arxiv": arxiv,
            "zenodo": zenodo,
            "github": github,
            "huggingface": hf,
        }
        self._append_jsonl(payload)
        if not force:
            _record_audit()

        day = datetime.datetime.utcnow().strftime("%Y%m%d")
        slug = self._slug(target_ecosystem)
        report_path = REPORTS_DIR / f"red_team_audit_{slug}_{day}.md"

        def fmt_list(items: list, key_prefs: list[str]) -> str:
            lines = []
            for it in items[:8]:
                if "error" in it:
                    lines.append(f"- ERROR: {it['error']}")
                    continue
                label = next((str(it[k]) for k in key_prefs if it.get(k)), json.dumps(it)[:120])
                url = it.get("url", "")
                lines.append(f"- {label}" + (f" — {url}" if url else ""))
            return "\n".join(lines) if lines else "- (none)"

        md = f"""# RED TEAM OODA LOOP AUDIT REPORT (structured)

Target: {target_ecosystem}
Timestamp: {ts}
Miner: ecosystem-sim academic_miner v1.1 (throttled)

## ArXiv
{fmt_list(arxiv, ["title"])}

## Zenodo / open data
{fmt_list(zenodo, ["title"])}

## GitHub
{fmt_list(github, ["full_name"])}

## HuggingFace
{fmt_list(hf, ["modelId"])}

## Downstream
- JSONL append: `{JSONL_PATH}`
- Review candidates before estate injection (see dcoop-workflows/agy-harvest-2026-07-21/GEM-CATALOG.md)
- Qdrant auto-upsert with zero vectors: **disabled**
"""
        report_path.write_text(md, encoding="utf-8")
        print(f"[RED TEAM] Wrote {report_path}")
        return str(report_path)

    def execute_mining_workflow(self, prompt: str) -> str:
        """Alias used by server.py agent chat path."""
        return self.execute_red_team_audit(prompt, force=True)


if __name__ == "__main__":
    miner = AcademicResearchMiner()
    print(miner.execute_red_team_audit("Rust WASM edge", force=True))
