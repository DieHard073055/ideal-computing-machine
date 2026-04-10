#!/bin/sh
# Send mock USDC (mUSDC) from an Anvil pre-funded account to any address.
# No local Foundry install needed — uses docker exec into the anvil container.
#
# Usage:
#   ./scripts/local/fund-address.sh <wallet_address> [amount_in_usdc]
#
# Examples:
#   ./scripts/local/fund-address.sh 0xDEDD57F4... 10
#   ./scripts/local/fund-address.sh 0xDEDD57F4...       # defaults to 10 USDC

set -e

ADDRESS="${1:?First arg must be the recipient address (e.g. 0x...)}"
AMOUNT_USDC="${2:-10}"

TOKEN="0x5FbDB2315678afecb367f032d93F642f64180aa3"
PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
RPC="http://localhost:8545"
# 6 decimals — same as USDC
AMOUNT_WEI=$(awk "BEGIN {printf \"%d\", $AMOUNT_USDC * 1000000}")

echo "Sending $AMOUNT_USDC mUSDC → $ADDRESS"

docker exec lucky-anvil-1 cast send "$TOKEN" \
  "transfer(address,uint256)" "$ADDRESS" "$AMOUNT_WEI" \
  --rpc-url    "$RPC" \
  --private-key "$PK" \
  --quiet

echo "Done. Check balance:"
echo "  ./scripts/local/check-balance.sh $ADDRESS"
