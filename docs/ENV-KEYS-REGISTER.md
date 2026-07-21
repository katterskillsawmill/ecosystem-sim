# Ecosystem-Sim — Env Keys & Accounts to Register

**Scope:** sim only. Values live in local `.env` (gitignored). This file lists **what to register**, not secrets.

Run audit anytime:

```bash
bash scripts/env-audit.sh
# or
npm run env:audit
```

## Tier 0 — Core (stack runs without most keys)

| Key | Status target | Register |
| --- | --- | --- |
| `GITHUB_PAT` / `GITHUB_TOKEN` | **Required for reliable miner** | GitHub → Settings → Developer settings → PAT (or `gh auth`) |
| Redis / compose | local docker | none |

## Tier 1 — Miner quality (recommended next)

| Key | Register |
| --- | --- |
| `HF_TOKEN` | https://huggingface.co/settings/tokens |

## Tier 2 — Real F100 council LLM actors (stubs until set)

| Key | Register | Actor |
| --- | --- | --- |
| `GROK_API_KEY` | xAI console | GrokObserver |
| `CLAUDE_API_KEY` | Anthropic console | Mangos claude tier |
| `OPENAI_API_KEY` | OpenAI (or estate SpaceXAI) | OpenAI-compatible clients |
| `MOONSHOT_API_KEY` / `KIMI_API_KEY` | Moonshot Open Platform | KimiObserver |
| `NIM_BASE_URL` / `DEEPSEEK_BASE_URL` | Local NIM/vLLM (e.g. `:8000`) | DeepSeekNIMOrienter |
| Ollama models | `ollama pull` Hermes/etc. | OllamaHermesCommander |

## Tier 3 — Deep tech topic demos (optional)

| Key | Register |
| --- | --- |
| `AZURE_QUANTUM_CONNECTION_STRING` | Azure Quantum workspace |
| `FOXGLOVE_API_KEY` | Foxglove |
| `ODDS_API_KEY` | The Odds API |
| `ALPACA_API_KEY` + `ALPACA_SECRET_KEY` | Alpaca paper |
| `ALCHEMY_RPC_URL` | Alchemy app |

## Tier 4 — Portal / publishing (optional)

| Key | Register |
| --- | --- |
| `PORTAL_ADMIN_PASS` | Generate real hash (not template) |
| `GHOST_ADMIN_API_KEY` | Ghost Admin API |
| `VERCEL_DEPLOY_HOOK` | Vercel deploy hook |
| `NEXT_PUBLIC_PORTAL_URL` | Real public portal URL |

## Tier 5 — Persistence (optional Phase 7)

| Key | Register |
| --- | --- |
| `SUPABASE_URL` + service role | Supabase project |
| `PINECONE_API_KEY` | Pinecone |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Vercel KV / Upstash |
| `QDRANT_URL` + `QDRANT_API_KEY` | Qdrant Cloud / self-host |

## Ops flags

| Key | Default | Meaning |
| --- | --- | --- |
| `ENABLE_BACKEND_OODA` | `0` | In-process API OODA loop (prefer worker only) |
| `WORKER_LOOP_SLEEP_SEC` | `300` | Worker cycle sleep |
| `MINER_MIN_INTERVAL_SEC` | `300` | Miner throttle |
| `MINER_MAX_AUDITS_PER_HOUR` | `12` | Hourly cap |
| `SIM_REPORTS_DIR` | compose volume path | Structured reports root |
| `BROKER_URL` / `MANGOS_URL` | unset | Future real cost router |

## Live ports (HQ compose)

| Service | Host |
| --- | --- |
| Backend API | **3135** |
| Frontend | **3002** |
| Redis | **6379** |
