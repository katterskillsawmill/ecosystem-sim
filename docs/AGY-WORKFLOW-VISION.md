# AGY Workflow Vision vs Implementation

Sources: `~/.gemini/antigravity-cli/brain/14a3241e-*` terminal/agent/scaffold plans + walkthrough.

| AGY claim | Status | Implementation |
| --- | --- | --- |
| Interactive terminals per eco | **Done** | `ComputerTerminal` + proximity Html UI |
| Free-text agent chat | **Partial** | `/api/agent/chat` — workflow verbs hit disk; LLM paths still stub without keys |
| Execute workflows on CPX62 ecos | **Done (P0)** | `/api/workflow/run` → `/root/ecosystems/ecosystem-*` |
| NPC agent buttons | **Done** | `AgentCharacter` → workflow API (no alerts) |
| Scaffold / devluxe --ai-tailor | **Guarded** | `ALLOW_SIM_SCAFFOLD=0` default; receipt only |
| Broker task submit | **Optional** | `broker_task` action if `BROKER_API_KEY` set |
| Twin stream logs | **Partial** | WS works when clients connected |

## Estate landing path

Artifacts land in:

```text
/root/ecosystems/ecosystem-<name>/.ai-notes/sim-workflows/<timestamp>_<action>.md
```

Not in `/root/cpx62-broker` (broker deploy tree).
