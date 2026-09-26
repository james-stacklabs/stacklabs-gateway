#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== STACKLABS EDGE DEPLOY PIPELINE ==="
python3 verify_edge_deploy.py

echo ""
echo "=== EXECUTING WRANGLER DEPLOY ==="
npx wrangler deploy --config wrangler.jsonc

echo ""
echo "=== POST-DEPLOY VERIFICATION ==="
curl -s -I "https://www.stacklabsllc.com" | head -n 5
curl -s -I "https://www.stacklabsllc.com/drop" | head -n 5

echo ""
echo "✅ Edge deployment and verification completed successfully."
