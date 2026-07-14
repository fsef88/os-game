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

echo "[1/4] validate docs"
python3 "$ROOT/scripts/validate_docs.py"

echo "[2/4] template checks"
check_project "$ROOT/90_PROJECTS/TEMPLATE/src" "Checking TEMPLATE"

echo "[3/4] technical pilot checks"
check_project "$ROOT/90_PROJECTS/SeedClickerMini/src" "Checking SeedClickerMini"

echo "[4/4] thematic pilot checks"
check_project "$ROOT/90_PROJECTS/AlchemyLab/src" "Checking AlchemyLab"

echo "All checks passed."
