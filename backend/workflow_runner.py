"""
Real terminal/agent workflows that land artifacts under /root/ecosystems/ecosystem-*.

Safety: all paths resolved via realpath must stay under ECOSYSTEMS_DIR.
TS CLIs (plux/devluxe) preferred for heavy tools; this module is thin C2.
"""
from __future__ import annotations

import datetime
import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any

ECOSYSTEMS_DIR = Path(os.getenv("ECOSYSTEMS_DIR", "/root/ecosystems")).resolve()
ALLOW_SIM_SCAFFOLD = os.getenv("ALLOW_SIM_SCAFFOLD", "0").lower() in ("1", "true", "yes")
BROKER_URL = (os.getenv("BROKER_URL") or "http://127.0.0.1:3111").rstrip("/")
BROKER_API_KEY = os.getenv("BROKER_API_KEY") or os.getenv("INTERNAL_API_TOKEN") or ""


def _now() -> str:
    return datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def resolve_eco_path(target: str) -> Path:
    """Map dept name or ecosystem-* folder to absolute eco root under estate."""
    raw = (target or "").strip()
    if not raw:
        raise ValueError("target_ecosystem/folder required")

    # Direct folder name
    candidates = []
    if raw.startswith("ecosystem-"):
        candidates.append(ECOSYSTEMS_DIR / raw)
    else:
        # slug from dept display name
        slug = raw.lower().replace(" ", "-").replace("_", "-")
        candidates.append(ECOSYSTEMS_DIR / f"ecosystem-{slug}")
        # also try original casing folder
        for p in ECOSYSTEMS_DIR.glob("ecosystem-*"):
            if not p.is_dir():
                continue
            dept = p.name.replace("ecosystem-", "", 1).replace("-", " ").lower()
            if dept == raw.lower() or p.name.lower() == f"ecosystem-{slug}":
                candidates.insert(0, p)

    for c in candidates:
        try:
            real = c.resolve()
        except OSError:
            continue
        # allowlist
        try:
            real.relative_to(ECOSYSTEMS_DIR)
        except ValueError:
            continue
        if real.is_dir() and real.name.startswith("ecosystem-"):
            return real

    raise FileNotFoundError(f"No ecosystem dir for target={target!r} under {ECOSYSTEMS_DIR}")


def list_status(eco: Path) -> dict[str, Any]:
    top = sorted([p.name for p in eco.iterdir() if not p.name.startswith(".")])[:80]
    git_sb = None
    if (eco / ".git").exists():
        try:
            git_sb = subprocess.check_output(
                ["git", "-C", str(eco), "status", "-sb"],
                text=True,
                timeout=15,
                stderr=subprocess.STDOUT,
            ).strip()
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
            git_sb = f"git status failed: {e}"
    return {
        "path": str(eco),
        "top_level": top,
        "git_status": git_sb,
        "has_constellation": (eco / "constellation" / "constellation-doctor.sh").is_file(),
    }


def write_receipt(eco: Path, action: str, prompt: str, detail: dict[str, Any]) -> Path:
    notes = eco / ".ai-notes" / "sim-workflows"
    notes.mkdir(parents=True, exist_ok=True)
    ts = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    path = notes / f"{ts}_{action}.md"
    body = [
        f"# Sim Workflow Receipt — {action}",
        "",
        f"- **Time (UTC):** {_now()}",
        f"- **Ecosystem path:** `{eco}`",
        f"- **Action:** `{action}`",
        f"- **Prompt:** {prompt or '(none)'}",
        "",
        "## Detail",
        "",
        "```json",
        json.dumps(detail, indent=2, default=str)[:12000],
        "```",
        "",
        "_Written by ecosystem-sim `/api/workflow/run` (CPX62 estate)._",
        "",
    ]
    path.write_text("\n".join(body), encoding="utf-8")
    return path


def run_doctor(eco: Path) -> dict[str, Any]:
    script = eco / "constellation" / "constellation-doctor.sh"
    if not script.is_file():
        return {"status": "skip", "reason": "no constellation-doctor.sh"}
    try:
        out = subprocess.check_output(
            ["bash", str(script), str(eco)],
            text=True,
            timeout=120,
            stderr=subprocess.STDOUT,
            env={**os.environ, "SKIP_PLUX": "1", "SKIP_COOPLUX": "1"},
        )
        return {"status": "ok", "output": out[-4000:]}
    except subprocess.CalledProcessError as e:
        return {"status": "fail", "output": (e.output or "")[-4000:], "code": e.returncode}
    except subprocess.TimeoutExpired:
        return {"status": "timeout"}


def run_plux_mine(eco: Path) -> dict[str, Any]:
    plux = shutil.which("plux") or shutil.which("npx")
    out_dir = eco / ".ai-notes" / "mined"
    out_dir.mkdir(parents=True, exist_ok=True)
    # Prefer src if present
    target = eco / "src" if (eco / "src").is_dir() else eco
    try:
        if shutil.which("plux"):
            cmd = ["plux", "mine", str(target), "--out", str(out_dir)]
        else:
            cmd = ["npx", "--yes", "@cooplux/plux@0.2.1", "mine", str(target), "--out", str(out_dir)]
        out = subprocess.check_output(cmd, text=True, timeout=180, stderr=subprocess.STDOUT)
        return {"status": "ok", "out_dir": str(out_dir), "output": out[-3000:]}
    except FileNotFoundError:
        return {"status": "skip", "reason": "plux/npx not found"}
    except subprocess.CalledProcessError as e:
        return {"status": "fail", "output": (e.output or "")[-3000:], "code": e.returncode}
    except subprocess.TimeoutExpired:
        return {"status": "timeout"}


def run_devluxe_check(eco: Path) -> dict[str, Any]:
    bin_path = shutil.which("devluxe")
    if not bin_path:
        return {"status": "skip", "reason": "devluxe not on PATH"}
    try:
        out = subprocess.check_output(
            [bin_path, "check", str(eco)],
            text=True,
            timeout=120,
            stderr=subprocess.STDOUT,
        )
        return {"status": "ok", "output": out[-3000:]}
    except subprocess.CalledProcessError as e:
        # Soft: many ecos fail gate; still return output
        return {"status": "fail", "output": (e.output or "")[-3000:], "code": e.returncode}
    except subprocess.TimeoutExpired:
        return {"status": "timeout"}


def run_broker_task(eco: Path, prompt: str) -> dict[str, Any]:
    if not BROKER_API_KEY:
        return {"status": "skip", "reason": "BROKER_API_KEY/INTERNAL_API_TOKEN not set"}
    import urllib.request

    payload = {
        "type": "sim.workflow",
        "description": prompt or f"sim workflow for {eco.name}",
        "ecosystem": eco.name,
        "source": "ecosystem-sim",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BROKER_URL}/api/tasks",
        data=data,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-API-Key": BROKER_API_KEY,
            "Authorization": f"Bearer {BROKER_API_KEY}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="replace")[:2000]
            return {"status": "ok", "http": resp.getcode(), "body": body}
    except Exception as e:
        return {"status": "fail", "error": str(e)}


def run_workflow(
    action: str,
    target: str,
    prompt: str = "",
    dry_run: bool = False,
) -> dict[str, Any]:
    action = (action or "status").strip().lower()
    try:
        eco = resolve_eco_path(target)
    except (ValueError, FileNotFoundError) as e:
        return {"status": "error", "error": str(e), "ecosystems_dir": str(ECOSYSTEMS_DIR)}

    result: dict[str, Any] = {
        "status": "ok",
        "action": action,
        "target": target,
        "eco_path": str(eco),
        "eco_name": eco.name,
        "dry_run": dry_run,
        "ts": _now(),
    }

    if dry_run:
        result["would_run"] = action
        result["resolved"] = str(eco)
        return result

    detail: dict[str, Any] = {}

    if action in ("status", "list", "ls"):
        detail = list_status(eco)
        result["detail"] = detail
    elif action in ("receipt", "review"):
        detail = {"prompt": prompt or "review requested from sim agent/terminal"}
        path = write_receipt(eco, "review" if action == "review" else "receipt", prompt, detail)
        result["receipt"] = str(path)
        result["detail"] = detail
    elif action == "doctor":
        detail = run_doctor(eco)
        path = write_receipt(eco, "doctor", prompt, detail)
        result["receipt"] = str(path)
        result["detail"] = detail
    elif action in ("plux_mine", "mine"):
        detail = run_plux_mine(eco)
        path = write_receipt(eco, "plux_mine", prompt, detail)
        result["receipt"] = str(path)
        result["detail"] = detail
    elif action in ("devluxe_check", "check"):
        detail = run_devluxe_check(eco)
        path = write_receipt(eco, "devluxe_check", prompt, detail)
        result["receipt"] = str(path)
        result["detail"] = detail
    elif action in ("broker_task", "broker"):
        detail = run_broker_task(eco, prompt)
        path = write_receipt(eco, "broker_task", prompt, detail)
        result["receipt"] = str(path)
        result["detail"] = detail
    elif action in ("ooda", "ooda_real", "execute", "workflow"):
        # Real OODA-lite: status + receipt + soft doctor
        st = list_status(eco)
        doc = run_doctor(eco)
        detail = {"phase": "ooda_lite", "status": st, "doctor": doc, "prompt": prompt}
        path = write_receipt(eco, "ooda_lite", prompt or "execute workflow", detail)
        result["receipt"] = str(path)
        result["detail"] = detail
        result["message"] = f"OODA-lite complete for {eco.name}; receipt written"
    elif action in ("scaffold", "scaffold_safe"):
        if not ALLOW_SIM_SCAFFOLD:
            result["status"] = "blocked"
            result["error"] = "ALLOW_SIM_SCAFFOLD=0 (set to 1 to enable disk scaffolding)"
            return result
        detail = {"note": "scaffold path reserved; use devluxe manually until TVP lands"}
        path = write_receipt(eco, "scaffold_blocked", prompt, detail)
        result["receipt"] = str(path)
        result["detail"] = detail
    else:
        result["status"] = "error"
        result["error"] = f"unknown action: {action}"
        result["allowed"] = [
            "status", "receipt", "review", "doctor", "plux_mine",
            "devluxe_check", "broker_task", "ooda", "execute", "workflow",
        ]
        return result

    # Always ensure a receipt for write-ish actions that didn't set one
    if "receipt" not in result and action not in ("status", "list", "ls"):
        result["receipt"] = str(write_receipt(eco, action, prompt, result.get("detail") or {}))

    return result
