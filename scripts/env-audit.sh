#!/usr/bin/env bash
# env-audit.sh — classify .env vs .env.example; map missing keys by tier
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE="${ROOT}/.env.example"
LIVE="${ROOT}/.env"
TIER_STRICT="${ENV_AUDIT_STRICT_TIER:-1}"  # fail if Tier 0-1 missing/placeholder

is_placeholder() {
  local v="$1"
  [ -z "$v" ] && return 0
  echo "$v" | grep -Eiq 'xxx|your_|example|changeme|generate_|sk-ant-api03-xxx|sk-proj-xxx|ghp_xxx|hf_xxx|xai-xxx|PKxxx|pc-sk-xxx|ghost_xxx|foxglove_xxx|odds_xxx' && return 0
  [ "${#v}" -lt 8 ] && return 0
  return 1
}

# key|tier|feature
declare -a MAP=(
  "GITHUB_PAT|0|academic_miner_github"
  "GITHUB_TOKEN|0|academic_miner_github_alias"
  "HF_TOKEN|1|academic_miner_huggingface"
  "GROK_API_KEY|2|GrokObserver"
  "CLAUDE_API_KEY|2|Mangos_claude"
  "OPENAI_API_KEY|2|openai_compatible"
  "MOONSHOT_API_KEY|2|KimiObserver"
  "KIMI_API_KEY|2|KimiObserver_alias"
  "NIM_BASE_URL|2|DeepSeekNIM"
  "DEEPSEEK_BASE_URL|2|DeepSeekNIM_alias"
  "AZURE_QUANTUM_CONNECTION_STRING|3|AzureQuantumOrienter"
  "FOXGLOVE_API_KEY|3|foxglove"
  "ODDS_API_KEY|3|sportsinvest"
  "ALPACA_API_KEY|3|alpaca"
  "ALPACA_SECRET_KEY|3|alpaca"
  "ALCHEMY_RPC_URL|3|web3"
  "PORTAL_ADMIN_PASS|4|dane_portal"
  "GHOST_ADMIN_API_KEY|4|ghost"
  "VERCEL_DEPLOY_HOOK|4|vercel"
  "SUPABASE_URL|5|persistence"
  "SUPABASE_ANON_KEY|5|persistence"
  "PINECONE_API_KEY|5|vector_memory"
  "KV_REST_API_URL|5|vercel_kv"
  "KV_REST_API_TOKEN|5|vercel_kv"
  "QDRANT_API_KEY|5|qdrant"
  "QDRANT_URL|5|qdrant"
)

get_val() {
  local file="$1" key="$2"
  [ -f "$file" ] || { echo ""; return; }
  # last matching assignment
  grep -E "^${key}=" "$file" 2>/dev/null | tail -1 | cut -d= -f2- | sed 's/^["'\'']//;s/["'\'']$//' || true
}

echo "== ecosystem-sim env audit =="
echo "example: $EXAMPLE"
echo "live:    $LIVE"
echo ""
printf '%-40s %-6s %-12s %s\n' "KEY" "TIER" "STATUS" "FEATURE"
printf '%-40s %-6s %-12s %s\n' "---" "----" "------" "-------"

fail=0
for row in "${MAP[@]}"; do
  IFS='|' read -r key tier feat <<<"$row"
  val="$(get_val "$LIVE" "$key")"
  if [ -z "$val" ]; then
    st="MISSING"
  elif is_placeholder "$val"; then
    st="PLACEHOLDER"
  else
    st="SET"
  fi
  printf '%-40s %-6s %-12s %s\n' "$key" "$tier" "$st" "$feat"
  if [ "$tier" -le "$TIER_STRICT" ] && [ "$st" != "SET" ]; then
    # GITHUB_TOKEN can satisfy GITHUB_PAT tier0
    if [ "$key" = "GITHUB_PAT" ] || [ "$key" = "GITHUB_TOKEN" ]; then
      other=$([ "$key" = "GITHUB_PAT" ] && echo GITHUB_TOKEN || echo GITHUB_PAT)
      oval="$(get_val "$LIVE" "$other")"
      if ! is_placeholder "$oval" && [ -n "$oval" ]; then
        continue
      fi
    fi
    # HF is tier1 - soft recommend
    if [ "$tier" -eq 0 ]; then
      fail=1
    fi
  fi
done

echo ""
echo "Live ports (compose HQ): backend 3135, frontend 3002, redis 6379"
echo "ENABLE_BACKEND_OODA=$(get_val "$LIVE" ENABLE_BACKEND_OODA || echo 'unset→0')"
echo ""
if [ "$fail" -ne 0 ]; then
  echo "RESULT: FAIL (Tier 0 GitHub token missing/placeholder)"
  exit 1
fi
echo "RESULT: PASS (Tier 0 OK; review PLACEHOLDER rows for features you want live)"
exit 0
