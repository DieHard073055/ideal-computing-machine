# Lucky Draw App — Implementation Plan

## Overview

A centralised lucky draw platform where users register, buy tickets by sending USDT/USDC on supported chains, and an admin picks a winner per event. Multiple events can run in parallel.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack, SSR, API routes |
| Language | TypeScript | Type safety |
| Database | PostgreSQL (via Prisma ORM) | Relational, production-ready |
| EVM chains | ethers.js v6 | Ethereum, BNB Chain, Polygon |
| Solana | @solana/web3.js | Solana devnet |
| TRON | tronweb | TRON Nile testnet |
| Auth | jose (JWT) + bcryptjs | Edge-compatible JWT, password hashing |
| Styling | Tailwind CSS | Utility-first, fast to build |
| Key encryption | Node.js `crypto` (AES-256-CBC) | Encrypt stored private keys |

---

## Supported Chains & Testnets

| Chain | Testnet | Token | Contract Address |
|---|---|---|---|
| Ethereum | Sepolia | USDC | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| BNB Chain | BSC Testnet | USDT | `0x337610d27c682E347C9cD60BD4b3b107C9d34dDd` |
| Polygon | Amoy | USDC | `0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582` |
| Solana | Devnet | USDC | `Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr` |
| TRON | Nile | USDT | `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` |

---

## Environment Variables

All secrets and endpoints live in `.env.local` (never committed):

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lucky"

# App secret (32+ random bytes — used for JWT signing and AES key encryption)
APP_SECRET="change_me_to_random_hex"

# RPC Endpoints
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
BSC_TESTNET_RPC_URL="https://data-seed-prebsc-1-s1.binance.org:8545"
POLYGON_AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
SOLANA_RPC_URL="https://api.devnet.solana.com"
TRON_NILE_URL="https://nile.trongrid.io"

# Seed admin
ADMIN_EMAIL="admin@lucky.local"
ADMIN_PASSWORD="changeme"
```

---

## Database Schema (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  isAdmin      Boolean  @default(false)
  createdAt    DateTime @default(now())

  wallets Wallet[]
  tickets Ticket[]
}

model Wallet {
  id           String @id @default(cuid())
  userId       String
  chain        String  // "ethereum" | "bnb" | "polygon" | "solana" | "tron"
  address      String
  encryptedKey String  // AES-256-CBC encrypted private key

  user    User     @relation(fields: [userId], references: [id])
  tickets Ticket[]

  @@unique([userId, chain])
  @@unique([chain, address])
}

model Event {
  id          String    @id @default(cuid())
  name        String
  description String?
  ticketPrice Float     // in USDT/USDC (e.g. 10.0)
  chain       String    // which chain payments are accepted on
  status      String    @default("open")  // "open" | "closed" | "completed"
  winnerId    String?   @unique
  createdAt   DateTime  @default(now())
  closedAt    DateTime?

  tickets Ticket[]
  winner  Ticket?  @relation("EventWinner", fields: [winnerId], references: [id])
}

model Ticket {
  id          String    @id @default(cuid())
  ticketNumber String   @unique  // human-readable e.g. "EVT-001-0042"
  eventId     String
  userId      String
  walletId    String
  chain       String
  txHash      String?
  amount      Float
  status      String    @default("pending")  // "pending" | "confirmed"
  createdAt   DateTime  @default(now())
  confirmedAt DateTime?

  event     Event   @relation(fields: [eventId], references: [id])
  user      User    @relation(fields: [userId], references: [id])
  wallet    Wallet  @relation(fields: [walletId], references: [id])
  wonEvents Event[] @relation("EventWinner")
}
```

---

## Payment Check Strategy — Request Coalescing (10-second batching)

**No background polling.** Instead:

1. User clicks **Refresh** on their wallet/ticket page
2. Frontend calls `POST /api/payments/check` with the user's wallet addresses + event context
3. Backend adds those addresses to an in-memory **batch queue** per chain
4. A 10-second timer starts (if not already running) on the first request in a window
5. All requests that arrive within that 10-second window are held open (the HTTP request is kept pending)
6. When the timer fires, **one combined RPC query** goes to each chain:
   - EVM: single `queryFilter` for ERC20 `Transfer` events to any of the pending addresses
   - Solana: batch `getSignaturesForAddress` calls
   - TRON: batch event queries
7. Confirmed transfers are written to the DB as confirmed tickets
8. All held HTTP requests resolve with the results for their specific wallets

This means: no matter how many users click refresh at once, the blockchain sees at most **1 query per chain per 10 seconds**.

```
User A refreshes ─┐
User B refreshes ─┤─→ Batch queue → (10s timer) → 1 RPC call per chain → resolve all
User C refreshes ─┘
```

The batcher lives in `lib/payment/batcher.ts` as a module-level singleton (persists across requests in the same Node.js process).

---

## File Structure

```
lucky/
├── .env.local
├── .env.example
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # creates admin user + sample event
│
├── app/
│   ├── layout.tsx                # root layout: font, global styles
│   ├── page.tsx                  # public landing — open events grid
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx            # requires auth; user sidebar
│   │   ├── page.tsx              # my tickets
│   │   ├── events/
│   │   │   ├── page.tsx          # browse open events
│   │   │   └── [eventId]/page.tsx  # event detail + buy ticket flow
│   │   └── wallets/page.tsx      # my wallets + QR codes + refresh
│   │
│   ├── admin/
│   │   ├── layout.tsx            # requires isAdmin
│   │   ├── page.tsx              # overview: funds, recent payments
│   │   ├── events/
│   │   │   ├── page.tsx          # all events
│   │   │   ├── new/page.tsx      # create event
│   │   │   └── [eventId]/page.tsx  # manage: tickets, pick winner
│   │   └── wallets/page.tsx      # all wallets + balances
│   │
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       │
│       ├── user/
│       │   ├── wallets/route.ts       # GET — lazy-create wallets for all chains
│       │   └── tickets/route.ts       # GET — user's tickets
│       │
│       ├── events/
│       │   ├── route.ts               # GET — list open events
│       │   └── [eventId]/
│       │       ├── route.ts           # GET — event detail
│       │       └── tickets/route.ts   # POST — submit txHash → create pending ticket
│       │
│       ├── payments/
│       │   └── check/route.ts         # POST — trigger batched blockchain check
│       │
│       └── admin/
│           ├── events/
│           │   ├── route.ts                        # GET all, POST create
│           │   └── [eventId]/
│           │       ├── route.ts                    # PATCH status, DELETE
│           │       ├── winner/route.ts             # POST — pick random winner
│           │       └── tickets/route.ts            # GET all tickets
│           ├── wallets/route.ts                    # GET all wallets + balances
│           └── payments/[ticketId]/confirm/route.ts  # POST — manual confirm
│
├── lib/
│   ├── prisma.ts                 # singleton PrismaClient
│   ├── auth.ts                   # JWT sign/verify, password hashing, session helper
│   ├── crypto.ts                 # AES-256-CBC encrypt/decrypt for private keys
│   │
│   ├── wallet/
│   │   ├── index.ts              # getOrCreateWallet(userId, chain)
│   │   ├── evm.ts                # ethers.Wallet.createRandom()
│   │   ├── solana.ts             # Keypair.generate()
│   │   └── tron.ts               # TronWeb account generation
│   │
│   └── payment/
│       ├── batcher.ts            # request-coalescing batch processor (10s window)
│       ├── evm.ts                # check ERC20 transfers on EVM chains
│       ├── solana.ts             # check SPL token transfers on Solana
│       └── tron.ts               # check TRC20 transfers on TRON
│
├── components/
│   ├── ui/                       # reusable: Button, Badge, Card, Input, Modal
│   ├── EventCard.tsx
│   ├── TicketCard.tsx
│   ├── WalletCard.tsx            # shows address, QR code, copy button, refresh
│   ├── WinnerBanner.tsx
│   └── ChainBadge.tsx
│
├── middleware.ts                 # Next.js edge middleware — auth + admin guard
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## API Routes Summary

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create user, set JWT cookie |
| POST | `/api/auth/login` | Verify creds, set JWT cookie |
| POST | `/api/auth/logout` | Clear cookie |

### User
| Method | Path | Description |
|---|---|---|
| GET | `/api/user/wallets` | Return wallets; generate any missing chains |
| GET | `/api/user/tickets` | All tickets with event info |

### Events (public + user)
| Method | Path | Description |
|---|---|---|
| GET | `/api/events` | Open events with ticket counts |
| GET | `/api/events/[eventId]` | Single event detail |
| POST | `/api/events/[eventId]/tickets` | Submit txHash → create pending ticket |

### Payments
| Method | Path | Description |
|---|---|---|
| POST | `/api/payments/check` | Trigger batched chain check for wallet addresses |

### Admin
| Method | Path | Description |
|---|---|---|
| GET/POST | `/api/admin/events` | List all / create event |
| PATCH | `/api/admin/events/[id]` | Update status (close) |
| GET | `/api/admin/events/[id]/tickets` | All tickets for event |
| POST | `/api/admin/events/[id]/winner` | Pick random winner from confirmed tickets |
| GET | `/api/admin/wallets` | All wallets + on-chain balances |
| POST | `/api/admin/payments/[ticketId]/confirm` | Manually confirm a payment |

---

## Key UI Flows

### User: Buy a Ticket
1. Register / Login
2. Browse events on `/dashboard/events`
3. Click event → `/dashboard/events/[eventId]`
4. Page shows their wallet address for that event's chain (auto-created)
5. User sends exact ticket price in USDT/USDC to that address from any external wallet
6. User enters the tx hash and clicks **Submit**
7. System creates a pending ticket
8. User clicks **Refresh** → triggers batched chain check → ticket confirmed or still pending

### Admin: Run a Draw
1. Login with admin credentials
2. `/admin/events/new` → create event with name, price, chain
3. Monitor `/admin/events/[id]` to see incoming tickets + funds
4. Close event when ready → click **Pick Winner**
5. System randomly selects from confirmed tickets → winner displayed
6. Admin contacts winner externally

### Admin: View Funds
1. `/admin/wallets` — shows every user wallet, address, chain, and current token balance
2. To move funds: admin decrypts key (server-side), constructs and broadcasts transfer tx

---

## Auth Design

- JWT stored as `HttpOnly; Secure; SameSite=Lax` cookie named `__lucky_token`
- Payload: `{ sub: userId, isAdmin: boolean }`
- Signed with `APP_SECRET` using HS256 via `jose`
- 7-day expiry
- Edge middleware reads + verifies cookie before routes run
- `/admin/*` routes additionally check `isAdmin === true`

---

## Private Key Security

- Generated server-side, never sent to client
- Encrypted with AES-256-CBC before storing in DB
- Key material: `SHA-256(APP_SECRET)` → 32-byte AES key
- Each encrypted value includes a random 16-byte IV: stored as `iv_hex:ciphertext_hex`
- Decryption happens only server-side when admin needs to move funds

---

## Winner Selection

```
POST /api/admin/events/[eventId]/winner

1. Load all confirmed tickets for the event
2. If none → return 400
3. Pick random index: Math.floor(Math.random() * tickets.length)
4. Set Event.winnerId = ticket.id
5. Set Event.status = "completed"
6. Return winner: { ticketNumber, user: { email, name } }
```

---

## Implementation Order

1. **Init** — `create-next-app`, install deps, configure Prisma with PostgreSQL
2. **Schema** — `prisma/schema.prisma`, `prisma db push`, seed script
3. **Core libs** — `lib/prisma.ts`, `lib/auth.ts`, `lib/crypto.ts`
4. **Middleware** — `middleware.ts` (edge auth guard)
5. **Auth routes + pages** — register, login, logout
6. **Wallet generation** — `lib/wallet/`, `GET /api/user/wallets`
7. **Events** — admin CRUD + user browse/detail pages
8. **Ticket submission** — `POST /api/events/[eventId]/tickets`
9. **Payment batcher** — `lib/payment/batcher.ts` + chain checkers + `POST /api/payments/check`
10. **Winner selection** — `POST /api/admin/events/[eventId]/winner` + UI
11. **Admin wallets page** — balance fetching per chain
12. **Polish** — QR codes, copy buttons, chain badges, winner banner

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14",
    "@prisma/client": "^5",
    "ethers": "^6",
    "@solana/web3.js": "^1",
    "tronweb": "^5",
    "jose": "^5",
    "bcryptjs": "^2",
    "bs58": "^5",
    "qrcode.react": "^3"
  },
  "devDependencies": {
    "prisma": "^5",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/bcryptjs": "^2",
    "tailwindcss": "^3"
  }
}
```

**Webpack notes for Next.js compatibility:**
- `tronweb` (CJS) → add to `serverComponentsExternalPackages`
- `@solana/web3.js` → add to `serverComponentsExternalPackages`
- Both are server-only; never imported in client components
