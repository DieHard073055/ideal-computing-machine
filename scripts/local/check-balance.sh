#!/bin/sh
# Show the mUSDC balance of any address (raw units and human-readable).
#
# Usage:
#   ./scripts/local/check-balance.sh <address>

set -e

ADDRESS="${1:?Provide an address}"
TOKEN="0x5FbDB2315678afecb367f032d93F642f64180aa3"
RPC="http://localhost:8545"

RAW=$(docker exec lucky-anvil-1 cast call "$TOKEN" \
  "balanceOf(address)(uint256)" "$ADDRESS" \
  --rpc-url "$RPC")

# Convert from 6-decimal raw value to human-readable
HUMAN=$(awk "BEGIN {printf \"%.6f\", $RAW / 1000000}")

echo "$ADDRESS"
echo "  raw  : $RAW"
echo "  mUSDC: $HUMAN"
