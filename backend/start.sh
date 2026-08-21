#!/usr/bin/env bash
set -euo pipefail

mkdir -p data
echo "CivicAI boot check..."
python -c "from app.main import app; print('import_ok')"

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-10000}" \
  --log-level info \
  --timeout-keep-alive 120
