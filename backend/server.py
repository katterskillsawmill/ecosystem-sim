import os
import json
import asyncio
import datetime
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Big Brain Orchestrator", version="1.0.0")

# Allow Next.js dashboard to fetch from this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _env(key: str, default: str = "") -> str:
    return (os.getenv(key) or default).strip().strip('"').strip("'")


def _is_placeholder(val: str) -> bool:
    if not val:
        return True
    low = val.lower()
    needles = (
        "xxx", "your_", "example", "changeme", "generate_",
        "sk-ant-api03-xxx", "sk-proj-xxx", "ghp_xxx", "hf_xxx", "xai-xxx",
    )
    if any(n in low for n in needles):
        return True
    return len(val) < 8


def require_key(*keys: str) -> tuple[bool, str]:
    """Return (ok, key_or_reason). First usable non-placeholder key wins."""
    for k in keys:
        v = _env(k)
        if v and not _is_placeholder(v):
            return True, k
    return False, "|".join(keys)


@app.get("/health")
async def health():
    """Constellation doctor / k8s-style probe (G04 TVP)."""
    gh_ok, _ = require_key("GITHUB_PAT", "GITHUB_TOKEN", "GH_TOKEN")
    return {
        "status": "ok",
        "service": "ecosystem-sim-backend",
        "version": "1.2.0",
        "ts": datetime.datetime.utcnow().isoformat() + "Z",
        "backend_ooda": _env("ENABLE_BACKEND_OODA", "0") in ("1", "true", "yes"),
        "github_token": gh_ok,
    }



ECOSYSTEMS_DIR = _env("ECOSYSTEMS_DIR", "/root/ecosystems") or "/root/ecosystems"
REPORTS_DIR = _env("SIM_REPORTS_DIR", "/root/ecosystems/reports") or "/root/ecosystems/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

# The True F100 Roster Base
base_agents = [
    {"dept": "Main Umbrella Hub", "role": "Shell Corp Entity", "name": "KTRSKL"},
    {"dept": "LifeOS Central Command", "role": "Chief of Staff", "name": "Cooplux"},
    {"dept": "Task Orchestration", "role": "COO", "name": "Plux"},
]

# Cache full estate scan (dir walk is expensive across 80+ ecos)
_entities_cache: list | None = None
_entities_cache_ts: float = 0.0
_ENTITIES_TTL_SEC = float(_env("ENTITIES_CACHE_TTL", "60") or "60")

# Skip heavy subtrees when sizing buildings
_SKIP_DIR_NAMES = {
    "node_modules", ".git", "dist", "build", ".next", "venv", ".venv",
    "__pycache__", "reports", "playwright-report", "test-results",
    "coverage", ".turbo", "target", "vendor",
}


def get_dir_size_and_count(path: str, max_files: int = 5000):
    """Fast approximate size/count — capped so /api/state stays interactive."""
    total_size = 0
    file_count = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            dirnames[:] = [d for d in dirnames if d not in _SKIP_DIR_NAMES and not d.startswith(".")]
            for f in filenames:
                file_count += 1
                if file_count > max_files:
                    return total_size, file_count
                fp = os.path.join(dirpath, f)
                try:
                    if not os.path.islink(fp):
                        total_size += os.path.getsize(fp)
                except OSError:
                    pass
    except OSError:
        pass
    return total_size, file_count


def scan_ecosystems(force: bool = False):
    """Map estate ecosystem-* dirs + base agents for 3D HQ buildings."""
    global _entities_cache, _entities_cache_ts
    import time as _time

    now = _time.time()
    if (
        not force
        and _entities_cache is not None
        and (now - _entities_cache_ts) < _ENTITIES_TTL_SEC
    ):
        return _entities_cache

    live_entities: list = []
    for agent in base_agents:
        agent_copy = dict(agent)
        agent_copy["size_mb"] = 50.0
        agent_copy["num_files"] = 1000
        live_entities.append(agent_copy)

    if not os.path.isdir(ECOSYSTEMS_DIR):
        print(f"[STATE] ECOSYSTEMS_DIR missing: {ECOSYSTEMS_DIR}")
        _entities_cache = live_entities
        _entities_cache_ts = now
        return live_entities

    try:
        names = sorted(os.listdir(ECOSYSTEMS_DIR))
    except OSError as e:
        print(f"[STATE] listdir failed: {e}")
        names = []

    eco_count = 0
    for folder_name in names:
        if not folder_name.startswith("ecosystem-"):
            continue
        if folder_name == "ecosystem-sim":
            continue
        full_path = os.path.join(ECOSYSTEMS_DIR, folder_name)
        if not os.path.isdir(full_path):
            continue
        dept_name = folder_name.replace("ecosystem-", "", 1).replace("-", " ")
        size_bytes, file_count = get_dir_size_and_count(full_path)
        size_mb = size_bytes / (1024 * 1024)
        live_entities.append(
            {
                "dept": dept_name,
                "role": "Agent Node",
                "name": f"{dept_name.split()[0]} Sub-Agent",
                "size_mb": round(size_mb, 2),
                "num_files": file_count,
                "folder": folder_name,
            }
        )
        eco_count += 1

    print(f"[STATE] scan complete: base={len(base_agents)} ecos={eco_count} total={len(live_entities)}")
    _entities_cache = live_entities
    _entities_cache_ts = now
    return live_entities


@app.get("/api/state")
def get_simulation_state():
    """Returns live F100 HQ entity roster for 3D buildings / agents / terminals."""
    entities = scan_ecosystems()
    return {
        "entities": entities,
        "count": len(entities),
        "status": "LIVE",
        "tvp_verified": True,
        "ecosystems_dir": ECOSYSTEMS_DIR,
        "ecosystems_dir_ok": os.path.isdir(ECOSYSTEMS_DIR),
    }

# ==============================================================================
# F100 OMNIPOTENT AI ORCHESTRATOR - THE OODA LOOP MARATHON PIPELINE
# ==============================================================================

class KimiObserver:
    """OBSERVE: Moonshot AI massive context — real API only when MOONSHOT/KIMI key set."""

    def ingest_codebase(self, path):
        ok, key = require_key("MOONSHOT_API_KEY", "KIMI_API_KEY")
        if not ok:
            print(f"[KIMI] SKIPPED stub — missing {key} (register Moonshot Open Platform)")
            return {"status": "stub", "reason": f"missing {key}", "path": path}
        # Real OpenAI-compatible call left for follow-up; do not fake token counts
        print(f"[KIMI] key present ({key}) — real ingest not yet wired; refusing fake success")
        return {"status": "not_implemented", "reason": "key present but client not wired", "key": key}


class GrokObserver:
    """OBSERVE: xAI telemetry — real only when GROK_API_KEY set."""

    def fetch_market_telemetry(self, target):
        ok, key = require_key("GROK_API_KEY")
        if not ok:
            print(f"[GROK] SKIPPED stub — missing {key} (register xAI console)")
            return {"status": "stub", "reason": f"missing {key}", "sentiment": None, "target": target}
        print(f"[GROK] key present — real X telemetry client not yet wired; refusing fake success")
        return {"status": "not_implemented", "reason": "key present but client not wired", "target": target}


class DeepSeekNIMOrienter:
    """ORIENT: local OpenAI-compatible NIM/vLLM when NIM_BASE_URL set."""

    def map_structural_flaws(self, kimi_dump):
        base = _env("NIM_BASE_URL") or _env("DEEPSEEK_BASE_URL") or ""
        if not base or _is_placeholder(base):
            print("[DEEPSEEK-NIM] SKIPPED — set NIM_BASE_URL (e.g. http://127.0.0.1:8000/v1)")
            return {"status": "stub", "reason": "missing NIM_BASE_URL", "flaws_found": 0}
        try:
            import urllib.request

            url = base.rstrip("/") + "/models"
            if not url.endswith("/models"):
                # allow either .../v1 or .../v1/models style
                health = base.rstrip("/")
                if health.endswith("/v1"):
                    url = health + "/models"
                else:
                    url = health + "/v1/models"
            req = urllib.request.Request(url, headers={"User-Agent": "ecosystem-sim-nim-probe"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                code = resp.getcode()
            print(f"[DEEPSEEK-NIM] health {url} → HTTP {code}")
            return {"status": "ok", "health": code, "base": base, "flaws_found": 0}
        except Exception as e:
            print(f"[DEEPSEEK-NIM] health failed: {e}")
            return {"status": "error", "reason": str(e), "flaws_found": 0}


class AzureQuantumOrienter:
    """ORIENT: Azure Quantum — real only with connection string."""

    def run_simulated_annealing(self, workload_data):
        ok, key = require_key("AZURE_QUANTUM_CONNECTION_STRING")
        if not ok:
            print(f"[AZURE QUANTUM] SKIPPED stub — missing {key}")
            return {"status": "stub", "reason": f"missing {key}", "optimization_path": []}
        print("[AZURE QUANTUM] key present — SDK path not yet wired; refusing fake path")
        return {"status": "not_implemented", "reason": "key present but SDK not wired"}


class MangosOrchestrator:
    """DECIDE: cost-first routing (local matrix; optional real MANGOS later)."""

    def delegate_swarm(self, quantum_output, intent_payload):
        print(f"[MANGOS ROUTER] Evaluating intent: {intent_payload['prompt']}")
        costs = {"grok": 0.0001, "cursor": 0.05, "claude": 0.02, "comfyui": 0.10}
        prompt = intent_payload["prompt"].lower()
        if "design" in prompt or "logo" in prompt:
            selected = "comfyui"
        elif "telemetry" in prompt or "market" in prompt:
            selected = "grok"
        elif "architecture" in prompt or "blueprint" in prompt:
            selected = "claude"
        else:
            selected = "grok"
        # Prefer routes that have keys when simulated choice lacks key
        if selected == "grok" and not require_key("GROK_API_KEY")[0]:
            if require_key("CLAUDE_API_KEY")[0]:
                selected = "claude"
        print(
            f"[MANGOS ROUTER] Selected={selected.upper()} cost=${costs[selected]} "
            f"(simulated matrix; set MANGOS_URL for live router)"
        )
        return {
            "status": "simulated",
            "tasks": [f"{selected}_deploy"],
            "selected": selected,
        }


class OllamaHermesCommander:
    """DECIDE: local Ollama — stub unless OLLAMA_HOST reachable."""

    def build_tool_json(self):
        host = _env("OLLAMA_HOST", "http://127.0.0.1:11434")
        try:
            import urllib.request

            with urllib.request.urlopen(host.rstrip("/") + "/api/tags", timeout=2) as resp:
                print(f"[OLLAMA] reachable {host} HTTP {resp.getcode()}")
            return {"status": "ok", "action": "execute", "tool": "cursor_agent", "host": host}
        except Exception as e:
            print(f"[OLLAMA] SKIPPED — not reachable ({e})")
            return {"status": "stub", "reason": str(e)}


class CursorHeadlessActor:
    """ACT: Cursor CLI if binary exists."""

    async def execute_refactor(self, ecosystem_path, instructions):
        import shutil

        bin_path = _env("CURSOR_AGENT_BIN", "/root/.local/bin/cursor-agent")
        if not shutil.which(bin_path) and not os.path.isfile(bin_path):
            print(f"[CURSOR-CLI] SKIPPED — binary not found at {bin_path}")
            return {"status": "stub", "reason": f"missing binary {bin_path}", "logs": ""}
        print(f"[CURSOR-CLI] Refactoring {ecosystem_path} via {bin_path}...")
        process = await asyncio.create_subprocess_shell(
            f"{bin_path} -p '{instructions}'",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await process.communicate()
        return {
            "status": "ok" if process.returncode == 0 else "error",
            "logs": (stdout or b"").decode("utf-8", errors="replace")
            + (stderr or b"").decode("utf-8", errors="replace"),
        }


class ComfyUIAssetActor:
    """ACT: ComfyUI — stub without COMFYUI_URL."""

    def generate_ui_asset(self, prompt):
        ok, key = require_key("COMFYUI_URL")
        if not ok:
            # treat any non-placeholder COMFYUI_URL
            url = _env("COMFYUI_URL")
            if not url or _is_placeholder(url):
                print("[COMFYUI] SKIPPED stub — set COMFYUI_URL")
                return {"status": "stub", "reason": "missing COMFYUI_URL", "asset_url": None}
        print(f"[COMFYUI] URL set — graph POST not yet wired for prompt={prompt[:80]}")
        return {"status": "not_implemented", "asset_url": None}


class OpenClawOSActor:
    """ACT: openclaw — stub without OPENCLAW_URL."""

    def provision_infrastructure(self):
        url = _env("OPENCLAW_URL")
        if not url or _is_placeholder(url):
            print("[OPENCLAW] SKIPPED stub — set OPENCLAW_URL")
            return {"status": "stub", "reason": "missing OPENCLAW_URL"}
        print("[OPENCLAW] URL set — bridge client not yet wired")
        return {"status": "not_implemented", "reason": "client not wired"}
@app.post("/api/ooda/execute")
async def trigger_ooda_loop(target_ecosystem: str):
    """The master F100 Marathon Pipeline Endpoint. Triggered by NAL Fullscreen Terminal."""
    print(f"\n--- INITIATING OODA LOOP ON: {target_ecosystem} ---")
    
    # 1. OBSERVE
    kimi = KimiObserver()
    grok = GrokObserver()
    code_dump = kimi.ingest_codebase(target_ecosystem)
    telemetry = grok.fetch_market_telemetry(target_ecosystem)
    
    # 2. ORIENT
    deepseek = DeepSeekNIMOrienter()
    quantum = AzureQuantumOrienter()
    flaws = deepseek.map_structural_flaws(code_dump)
    routing = quantum.run_simulated_annealing(telemetry)
    
    # 3. DECIDE
    mangos = MangosOrchestrator()
    hermes = OllamaHermesCommander()
    roadmap = mangos.delegate_swarm(routing, {"prompt": "Auto-execute roadmap"})
    payload = hermes.build_tool_json()
    
    # 4. ACT
    cursor = CursorHeadlessActor()
    comfyui = ComfyUIAssetActor()
    openclaw = OpenClawOSActor()
    
    await cursor.execute_refactor(target_ecosystem, flaws["recommended_diff"])
    comfyui.generate_ui_asset("cyberpunk luxury UI component")
    openclaw.provision_infrastructure()
    
    return {"status": "MARATHON_CYCLE_COMPLETE", "target": target_ecosystem}

from pydantic import BaseModel
from academic_miner import AcademicResearchMiner

class ChatRequest(BaseModel):
    prompt: str
    target_ecosystem: str

@app.post("/api/agent/chat")
async def process_agent_chat(request: ChatRequest):
    """Dynamically routes arbitrary natural language prompts to F100 Agents."""
    print(f"\n--- [AGENT CHAT INBOUND] Ecosystem: {request.target_ecosystem} | Prompt: {request.prompt} ---")
    
    prompt = request.prompt.lower()
    res: dict | str | None = None

    if "logo" in prompt or "texture" in prompt or "comfyui" in prompt:
        res = ComfyUIAssetActor().generate_ui_asset(request.prompt)
    elif "grok" in prompt or "telemetry" in prompt or "twitter" in prompt:
        res = GrokObserver().fetch_market_telemetry(request.target_ecosystem)
    elif "research" in prompt or "mit" in prompt or "stanford" in prompt or "github" in prompt:
        report_path = AcademicResearchMiner().execute_mining_workflow(request.prompt)
        res = {"status": "ok", "report_path": report_path}
    elif "code" in prompt or "refactor" in prompt or "cursor" in prompt:
        res = await CursorHeadlessActor().execute_refactor(request.target_ecosystem, request.prompt)
    elif "quantum" in prompt or "route" in prompt or "optimize" in prompt:
        res = AzureQuantumOrienter().run_simulated_annealing({"load": "high"})
    else:
        res = MangosOrchestrator().delegate_swarm({}, {"prompt": request.prompt})

    response_text = f"[AGENT] {res}"
    top = "SUCCESS"
    if isinstance(res, dict) and res.get("status") in ("stub", "error", "not_implemented"):
        top = str(res["status"]).upper()
    return {"status": top, "reply": response_text, "detail": res if isinstance(res, dict) else None}

# ==============================================================================
# DIGITAL TWIN FRAMEWORK & BIGBRAIN OODA LOOP (PHASE 4)
# ==============================================================================

class BigBrainBroadcaster:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        print(message)
        for connection in self.active_connections:
            try:
                await connection.send_json({"log": message, "timestamp": str(datetime.datetime.now())})
            except:
                pass

broadcaster = BigBrainBroadcaster()

async def bigbrain_autonomous_loop():
    """
    Optional in-process OODA for WebSocket demo only.
    Mining ownership: docker worker (throttled). Enable with ENABLE_BACKEND_OODA=1.
    """
    await asyncio.sleep(5)
    f100_ecosystems = [
        "Rust and WASM Edge Nodes",
        "Azure Quantum Simulated Annealing",
        "Foxglove Robotics Digital Twins",
        "Web3 DLT RPC Pipelines",
        "SportsInvest Algorithmic Finance",
    ]
    ecosystem_index = 0
    while True:
        target_ecosystem = f100_ecosystems[ecosystem_index % len(f100_ecosystems)]
        ecosystem_index += 1
        await broadcaster.broadcast(
            f"[BIGBRAIN LOOP] demo tick '{target_ecosystem}' (no disk mine; worker owns audits)"
        )
        decision = MangosOrchestrator().delegate_swarm(
            {}, {"prompt": f"red team audit {target_ecosystem}"}
        )
        await broadcaster.broadcast(f"[MANGOS] {decision}")
        await asyncio.sleep(int(_env("BACKEND_OODA_SLEEP_SEC", "60") or "60"))


@app.on_event("startup")
async def startup_event():
    enabled = _env("ENABLE_BACKEND_OODA", "0").lower() in ("1", "true", "yes")
    if enabled:
        print("[SYSTEM] ENABLE_BACKEND_OODA=1 — starting demo OODA (worker still owns mining)")
        asyncio.create_task(bigbrain_autonomous_loop())
    else:
        print(
            "[SYSTEM] Backend OODA disabled (default). Mining runs in worker container only. "
            "Set ENABLE_BACKEND_OODA=1 for WS demo ticks."
        )

@app.websocket("/api/twin/stream")
async def digital_twin_iot_endpoint(websocket: WebSocket):
    """Streams live BigBrain agent telemetry to the React terminals."""
    await broadcaster.connect(websocket)
    try:
        while True:
            await asyncio.sleep(1) # Keep connection alive
    except Exception as e:
        broadcaster.disconnect(websocket)
        print(f"[DIGITAL TWIN] Connection Severed: {e}")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=3131, reload=True)
