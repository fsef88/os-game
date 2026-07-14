#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "[1/3] validate docs"
python3 "$ROOT/scripts/validate_docs.py"

echo "[2/3] template checks"
(
  cd "$ROOT/90_PROJECTS/TEMPLATE/src"
  npm install
  npm run typecheck
  npm run build
)

echo "[3/3] pilot checks"
(
  cd "$ROOT/90_PROJECTS/SeedClickerMini/src"
  npm install
  npm run typecheck
  npm run build
)

echo "All checks passed."
