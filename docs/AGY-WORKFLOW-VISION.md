# AGY Workflow Vision vs Implementation

Sources (AGY brain `~/.gemini/antigravity-cli/brain/14a3241e-*`):

| Plan | Theme |
| --- | --- |
| `dcoop_3d_hq_simulation_plan.md` | R3F HQ, agent NPCs, LifeOS campus |
| `f100_interactive_terminal_and_transparency_plan.md` | Live terminal CLI → FastAPI, not `alert()` |
| `f100_interactive_terminals_and_camera_plan.md` | Camera + terminal UX |
| `f100_agent_chat_and_pointer_fix_plan.md` | Free-text `/api/agent/chat` + pointer-lock cooldown |
| `f100_interiors_and_agent_interactions_plan.md` | Agent buttons → real actions |
| `f100_ai_tailored_scaffolding_plan.md` | `devluxe --ai-tailor` (guarded) |
| `f100_enhanced_ooda_loop_marathon_plan.md` / OODA marathon set | Estate OODA — **worker-only**, not dual backend |
| `f100_workflow_reconciliation_audit_plan.md` | Don’t re-run stale matrices blindly |
| `ecosystem_stubs_vision_plan.md` | Stubs must not fake success |
| Estate harvest | `~/dcoop-workflows/agy-harvest-2026-07-21/` (G01–G14) |

Also: per-eco `.gemini/` (styleguides + surgical-strike tasks) and bigbrain `DEVTRACK.md` / `.gemini/maps-workflow-resume-state.md`.

## Matrix: AGY claim → status

| AGY claim | Status | Implementation |
| --- | --- | --- |
| Interactive terminals per eco | **Live** | `ComputerTerminal` + proximity Html UI → `POST /api/workflow/run` |
| Free-text agent chat | **Live (verb-safe)** | `/api/agent/chat` — whole-word/first-token routing; free text → receipt on disk; LLM actors still stub without keys |
| Execute workflows on CPX62 ecos | **Live** | Land under `/root/ecosystems/ecosystem-*` (not `cpx62-broker`) |
| NPC agent buttons | **Live** | `AgentCharacter` → workflow API (OODA / review / status) |
| Base roster folders | **Live** | KTRSKL→whitelabel, Cooplux→cooperlux, Plux→bigbrain |
| Scaffold / devluxe --ai-tailor | **Guarded** | `ALLOW_SIM_SCAFFOLD=0`; receipt only |
| Broker task submit | **Optional** | `broker_task` if `BROKER_API_KEY` set |
| Twin stream logs | **Partial** | WS when clients connected |
| Pointer-lock cooldown | **Done** | `DanePlayer` canLock 1.5s |
| Honest stubs / single OODA owner | **Done** | Backend OODA off; worker owns heavy loops |
| Estate constellation doctor in-container | **Live** | Backend image has git + Node 22 for doctor/plux |

## Estate landing path

```text
/root/ecosystems/ecosystem-<name>/.ai-notes/sim-workflows/<timestamp>_<action>.md
```

Docker: `/root/ecosystems` mounted **rw** so receipts can write (path-allowlisted in `workflow_runner.resolve_eco_path`).

## Devtrack alignment (bigbrain)

| Track item | Sim workflow action |
| --- | --- |
| Health / constellation kit | `doctor` |
| Mine patterns / plux | `plux_mine` |
| Gate / package consumer | `devluxe_check` |
| OODA / execute | `ooda` (status + doctor + receipt) |
| Review / conversation | `review` or free-text → `receipt` |
| Broker handoff | `broker_task` |

## Operator commands (terminal or agent)

```text
status | ls | list     → top files + git -sb
doctor                 → constellation-doctor.sh
execute | ooda | run   → OODA-lite + receipt
mine | plux            → plux mine → .ai-notes/mined
review                 → review receipt
<free text>            → receipt in eco (or routed actor)
```

## UI

- Hard-refresh: http://91.98.84.0:3002/
- API: http://91.98.84.0:3135/health · `POST /api/workflow/run`

## What AGY over-promised (do not re-open blindly)

1. **Mass OODA rewrite of 85 ecos** (enhanced marathon) — held under F100 PR freeze / governance TS-first.
2. **Python LangGraph orchestration** — rejected by estate law; TS/BullMQ owns orchestration.
3. **Un-gated scaffolding** — still `ALLOW_SIM_SCAFFOLD=0`.
4. **Matrix reconciler mass mutate** — audit-only until operator approve.

## Next AGY conversation hooks

1. Wire real LLM reply path for free-text when OpenRouter/xAI keys present (keep receipt write).
2. Optional WS log stream of workflow stdout into terminal panel.
3. Selective constellation kit roll to ecos missing `constellation-doctor.sh` (G01).
4. Revisit AI-tailor scaffold only after TVP + dry-run receipt path proven.
