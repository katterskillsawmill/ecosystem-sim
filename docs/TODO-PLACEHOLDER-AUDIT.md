# Ecosystem-Sim — TODO / Placeholder / Stub Audit

## Actors (in-process “council teams”)

| Actor | File | State | TODO |
| --- | --- | --- | --- |
| KimiObserver | server.py | Stub report writer | Real Moonshot API when `MOONSHOT_API_KEY` set |
| GrokObserver | server.py | Stub JSON writer | Real xAI when `GROK_API_KEY` set |
| DeepSeekNIMOrienter | server.py | TODO ping `:8000` | Health/chat to `NIM_BASE_URL` |
| AzureQuantumOrienter | server.py | Stub path | Azure SDK when connection string set |
| MangosOrchestrator | server.py | Simulated costs | Optional real MANGOS HTTP |
| OllamaHermesCommander | server.py | Stub | Ollama tool JSON |
| CursorHeadlessActor | server.py | Shell if binary exists | Feature-detect path |
| ComfyUIAssetActor | server.py | Stub URL | ComfyUI API |
| OpenClawOSActor | server.py | Stub | openclaw bridge |
| AcademicResearchMiner | academic_miner.py | **Real** HTTP | HF token for better HF API |

## Bugs tracked

| ID | Issue | Fix |
| --- | --- | --- |
| B1 | Dual OODA (server 15s + worker 300s) | `ENABLE_BACKEND_OODA=0` default |
| B2 | Stubs claim success | Return `status:stub` + missing key |
| B3 | DeepSeek TODO | Optional NIM ping |
| B5 | Report path sprawl | `SIM_REPORTS_DIR` |
| B6 | Port 3001 vs 3002 | Docs/doctor align to compose |

## Placeholders

See `docs/ENV-KEYS-REGISTER.md` and run `bash scripts/env-audit.sh`.
