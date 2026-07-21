#!/usr/bin/env bash
# constellation-doctor.sh — ROI-path probe for DCoop ecosystems
#
# Soft-first by default: reports status, non-zero only on hard failures
# (missing Node, qbts pipeline fail when qbts.json present and DOCTOR_HARD=1).
#
# Usage:
#   ./constellation-doctor.sh [ECO_ROOT]
# Env:
#   DOCTOR_HARD=1          fail on soft warnings too
#   BROKER_URL=...         default http://127.0.0.1:3111 (plux status)
#   SKIP_PLUX=1            skip broker probe
#   SKIP_DEVLUXE=1         skip governance check
#   SKIP_QBTS=1            skip qbts pipeline
#   SKIP_COOPLUX=1         skip cooplux tools/status
set -euo pipefail

ECO_ROOT="$(cd "${1:-.}"; pwd)"
DOCTOR_HARD="${DOCTOR_HARD:-0}"
BROKER_URL="${BROKER_URL:-http://127.0.0.1:3111}"
WARN=0
FAIL=0

log()  { printf '%s\n' "$*"; }
ok()   { log "  OK  $*"; }
warn() { log "  WARN $*"; WARN=$((WARN+1)); }
fail() { log "  FAIL $*"; FAIL=$((FAIL+1)); }

need_node() {
  if ! command -v node >/dev/null 2>&1; then
    fail "node not on PATH"
    return 1
  fi
  ok "node $(node -v)"
}

section() { log ""; log "== $* =="; }

section "constellation-doctor · $ECO_ROOT"
need_node || true

# --- cooplux inventory ---
if [[ "${SKIP_COOPLUX:-0}" != "1" ]]; then
  section "cooplux tools/status"
  if npx --yes @cooplux/cli@0.2.1 tools >/tmp/cooplux-tools.out 2>&1; then
    ok "cooplux tools"
    head -20 /tmp/cooplux-tools.out | sed 's/^/    /'
  else
    warn "cooplux tools failed (network/npx?)"
    cat /tmp/cooplux-tools.out | tail -5 | sed 's/^/    /'
  fi
  if (cd "$ECO_ROOT" && npx --yes @cooplux/cli@0.2.1 status --json >"/tmp/cooplux-status.json" 2>/tmp/cooplux-status.err); then
    ok "cooplux status --json"
  else
    warn "cooplux status (non-fatal): $(head -1 /tmp/cooplux-status.err)"
  fi
fi

# --- plux broker probe (estate control plane) ---
if [[ "${SKIP_PLUX:-0}" != "1" ]]; then
  section "plux status (broker ${BROKER_URL})"
  if curl -sf -o /dev/null --max-time 3 "${BROKER_URL}/health" 2>/dev/null \
     || curl -sf -o /dev/null --max-time 3 "${BROKER_URL}/api/health" 2>/dev/null; then
    ok "broker HTTP reachable"
  else
    warn "broker not reachable at ${BROKER_URL} (expected on HQ; OK on pure CI runners)"
  fi
  if (cd "$ECO_ROOT" && BROKER_URL="$BROKER_URL" npx --yes @cooplux/plux@0.2.0 status >/tmp/plux-status.out 2>&1); then
    ok "plux status"
    head -15 /tmp/plux-status.out | sed 's/^/    /'
  else
    warn "plux status failed (broker/env); see tail"
    tail -8 /tmp/plux-status.out | sed 's/^/    /' || true
  fi
fi

# --- devluxe governance ---
if [[ "${SKIP_DEVLUXE:-0}" != "1" ]]; then
  if [[ "$DOCTOR_HARD" == "1" ]]; then
    section "devluxe check --gate (HARD)"
    if (cd "$ECO_ROOT" && npx --yes @devluxe/cli@0.2.0 check . --gate >/tmp/devluxe-check.out 2>&1); then
      ok "devluxe check --gate PASS"
      cat /tmp/devluxe-check.out | sed 's/^/    /'
    else
      fail "devluxe check --gate"
      cat /tmp/devluxe-check.out | sed 's/^/    /'
    fi
  else
    section "devluxe check (soft advisory)"
    if (cd "$ECO_ROOT" && npx --yes @devluxe/cli@0.2.0 check . >/tmp/devluxe-check.out 2>&1); then
      ok "devluxe check PASS"
    else
      warn "devluxe check reported issues (set DOCTOR_HARD=1 after governance scrub)"
      cat /tmp/devluxe-check.out | sed 's/^/    /'
    fi
  fi
fi

# --- qbts local doctor pipeline ---
if [[ "${SKIP_QBTS:-0}" != "1" ]]; then
  section "qbts doctor pipeline"
  QBTS_JSON=""
  for cand in "$ECO_ROOT/constellation/qbts.json" "$ECO_ROOT/qbts.json"; do
    if [[ -f "$cand" ]]; then QBTS_JSON="$cand"; break; fi
  done
  if [[ -z "$QBTS_JSON" ]]; then
    warn "no qbts.json (scaffold with: npx @qbts/cli init constellation/)"
  else
    ok "using $QBTS_JSON"
    DIR="$(dirname "$QBTS_JSON")"
    if (cd "$DIR" && npx --yes @qbts/cli@0.3.0 validate >/tmp/qbts-val.out 2>&1); then
      ok "qbts validate"
    else
      fail "qbts validate"; cat /tmp/qbts-val.out | sed 's/^/    /'
    fi
    if (cd "$DIR" && npx --yes @qbts/cli@0.3.0 run --dry-run >/tmp/qbts-dry.out 2>&1); then
      ok "qbts run --dry-run"
      head -20 /tmp/qbts-dry.out | sed 's/^/    /'
    else
      fail "qbts run --dry-run"; cat /tmp/qbts-dry.out | sed 's/^/    /'
    fi
  fi
fi

section "summary"
log "  warnings=$WARN failures=$FAIL hard=$DOCTOR_HARD eco=$ECO_ROOT"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
if [[ "$DOCTOR_HARD" == "1" && "$WARN" -gt 0 ]]; then
  exit 1
fi
exit 0
