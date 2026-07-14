#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

check_project() {
  local project_path="$1"
  local label="$2"

  echo "$label"
  (
    cd "$project_path"
    npm install
    npm run typecheck
    npm run build
  )
}

echo "[1/5] validate docs"
python3 "$ROOT/scripts/validate_docs.py"

echo "[2/5] template checks"
check_project "$ROOT/90_PROJECTS/TEMPLATE/src" "Checking TEMPLATE"

echo "[3/5] technical pilot checks"
check_project "$ROOT/90_PROJECTS/SeedClickerMini/src" "Checking SeedClickerMini"

echo "[4/5] previous thematic pilot checks"
check_project "$ROOT/90_PROJECTS/AlchemyLab/src" "Checking AlchemyLab"

echo "[5/5] active toy-first pilot checks"
check_project "$ROOT/90_PROJECTS/BlackHole/src" "Checking BlackHole"

echo "All checks passed."
