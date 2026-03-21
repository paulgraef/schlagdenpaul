#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npx >/dev/null 2>&1; then
  echo "Fehler: npx wurde nicht gefunden. Bitte Node.js/npm installieren."
  exit 1
fi

PIN_INPUT="${1:-${NEXT_PUBLIC_ADMIN_PIN:-}}"

if [[ -n "$PIN_INPUT" ]]; then
  export NEXT_PUBLIC_ADMIN_PIN="$PIN_INPUT"
  echo "Admin PIN für Build gesetzt."
else
  echo "Hinweis: NEXT_PUBLIC_ADMIN_PIN nicht gesetzt, Fallback ist 1234."
fi

echo "==> Static Build (out/)"
npm run build:firebase

echo "==> Firebase Deploy (hosting)"
npm run firebase:deploy

echo "Fertig."
