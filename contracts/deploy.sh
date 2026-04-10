#!/bin/sh
# Deploys MockToken to Anvil and mints 1 M tokens to every pre-funded account.
# Runs inside the ghcr.io/foundry-rs/foundry container.
set -e

RPC="${RPC:-http://anvil:8545}"
PK="${PK:-0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80}"

# ── Expected deterministic address ───────────────────────────────────────────
# CREATE from 0xf39F...2266 at nonce 0 always yields this address.
EXPECTED="0x5FbDB2315678afecb367f032d93F642f64180aa3"

echo ""
echo "━━━ Deploying MockToken (mUSDC) ━━━"
OUT=$(forge create /contracts/MockToken.sol:MockToken \
  --rpc-url    "$RPC" \
  --private-key "$PK" \
  --constructor-args "Mock USDC" "mUSDC" \
  --broadcast 2>&1)

echo "$OUT"

# Try both output formats (stable: "Deployed to:", nightly: "contract address:")
DEPLOYED=$(echo "$OUT" | grep -i "Deployed to:" | awk '{print $NF}')
if [ -z "$DEPLOYED" ]; then
  DEPLOYED=$(echo "$OUT" | grep -i "contract address:" | awk '{print $NF}')
fi
if [ -z "$DEPLOYED" ]; then
  # Fall back to the known deterministic address and trust it
  echo "NOTE: could not parse address from output; using deterministic address"
  DEPLOYED="$EXPECTED"
fi

if [ "$DEPLOYED" != "$EXPECTED" ]; then
  echo "WARNING: deployed at $DEPLOYED (expected $EXPECTED — env var mismatch?)"
fi

echo ""
echo "━━━ Minting 1 000 000 mUSDC to each Anvil account ━━━"
# 1 000 000 × 10^6 (6 decimals)
AMOUNT="1000000000000"

for ADDR in \
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" \
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" \
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906" \
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" \
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" \
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9" \
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" \
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" \
  "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"; do
  echo "  → $ADDR"
  cast send "$DEPLOYED" "mint(address,uint256)" "$ADDR" "$AMOUNT" \
    --rpc-url    "$RPC" \
    --private-key "$PK" \
    --quiet
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  MockToken (mUSDC) : $DEPLOYED"
echo "  All 10 Anvil accounts funded with 1 000 000 mUSDC"
echo "  Use scripts/local/fund-address.sh to top up any address"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
