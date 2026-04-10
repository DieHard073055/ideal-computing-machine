#!/bin/sh
# Simulate a real USDC transfer to a wallet address, then print the tx hash.
# Use this to test the full payment flow without an external wallet.
#
# Usage:
#   ./scripts/local/simulate-payment.sh <to_address> [amount_usdc]
#
# After running this, paste the tx hash into the app and click Refresh.

set -e

TO="${1:?First arg must be the recipient wallet address}"
AMOUNT_USDC="${2:-10}"
AMOUNT_WEI=$(awk "BEGIN {printf \"%d\", $AMOUNT_USDC * 1000000}")

TOKEN="0x5FbDB2315678afecb367f032d93F642f64180aa3"
PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
RPC="http://localhost:8545"

echo ""
echo "Simulating payment of $AMOUNT_USDC mUSDC → $TO"
echo ""

TX=$(docker exec lucky-anvil-1 cast send "$TOKEN" \
  "transfer(address,uint256)" "$TO" "$AMOUNT_WEI" \
  --rpc-url    "$RPC" \
  --private-key "$PK" \
  --json | grep -o '"transactionHash":"[^"]*"' | cut -d'"' -f4)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Tx hash : $TX"
echo "  Amount  : $AMOUNT_USDC mUSDC"
echo "  To      : $TO"
echo ""
echo "  Next steps:"
echo "  1. Paste the tx hash into the app and click Submit"
echo "  2. Click Refresh to confirm the payment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
