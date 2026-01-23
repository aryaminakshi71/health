#!/usr/bin/env bash
set -euo pipefail

# Nightly retention cleanup for recordings

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
DAYS="${RETENTION_DAYS:-}" # optional override

if [ -n "$DAYS" ]; then
  QUERY="?days=${DAYS}"
else
  QUERY=""
fi

curl -sS -X POST "${BACKEND_URL}/api/v1/camera/recordings/retention/cleanup${QUERY}" || true


