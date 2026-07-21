# Workflow API Contract

## `POST /api/workflow/run`

```json
{
  "action": "status|receipt|review|doctor|plux_mine|devluxe_check|broker_task|ooda|execute",
  "target_ecosystem": "abkc",
  "folder": "ecosystem-abkc",
  "prompt": "optional free text",
  "dry_run": false
}
```

### Response (success)

```json
{
  "status": "ok",
  "action": "ooda",
  "eco_path": "/root/ecosystems/ecosystem-abkc",
  "eco_name": "ecosystem-abkc",
  "receipt": "/root/ecosystems/ecosystem-abkc/.ai-notes/sim-workflows/....md",
  "detail": {}
}
```

### Safety

- Resolved path must stay under `ECOSYSTEMS_DIR` (default `/root/ecosystems`)
- Only `ecosystem-*` directories
- Scaffold blocked unless `ALLOW_SIM_SCAFFOLD=1`

### Terminal commands

| Type | Action |
| --- | --- |
| `status` / `ls` | list top files + git -sb |
| `doctor` | constellation-doctor.sh if present |
| `mine` / `plux` | plux mine into `.ai-notes/mined` |
| `execute` / `ooda` / `workflow` | OODA-lite (status+doctor+receipt) |
| `review` | review receipt |
| free text | receipt (or keyword route) |
