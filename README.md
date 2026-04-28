# Monolith — Institutional Treasury Vault

![CI/CD](https://github.com/Atharvashind/treasury-vault/actions/workflows/ci.yml/badge.svg)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Soroban](https://img.shields.io/badge/Soroban-v22-purple)

> Institutional-grade treasury management on the Stellar network.

Monolith is a non-custodial treasury vault built on Stellar using Soroban smart contracts. Deposit XLM, earn algorithmic yield, and redeem at any time — all governed by immutable on-chain contracts.

---

## 🌐 Live Links

| | Link |
|---|---|
| **App** | [https://atharav-beta.vercel.app](https://atharav-beta.vercel.app) |
| **Vault Contract** | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CBN4ZR3FTJFIOISCWVF27GXUDAFLNSMVP6BTOWPBEBKES2VOIHS2HS6J) |
| **Token (XLM SAC)** | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Admin Account** | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/account/GC5HL2KXTCEXGZU4N6QIDQLIXW6HSFYEZV7ELAEEHDL4EHUMVSTZCPX6) |
| **GitHub** | [Atharvashind/monolith](https://github.com/Atharvashind/monolith) |

---

## 🐛 Feedback & Fixes

| # | Feedback | Fix | Commit |
|---|----------|-----|--------|
| 1 | Transaction history doesn't work | Fixed event fetching — use 10,000-ledger window to stay within RPC retention range; implemented raw JSON-RPC decoder for protocol 22+ XDR to bypass stellar-sdk parsing errors | [`9762c5d`](https://github.com/Atharvashind/treasury-vault/commit/9762c5d998539dec21efc139c861513d7169ad60) |
| 2 | Pricing page doesn't make sense | Removed Pricing from navigation entirely — vault is free to use, no pricing tiers needed | [`9762c5d`](https://github.com/Atharvashind/treasury-vault/commit/9762c5d998539dec21efc139c861513d7169ad60) |
| 3 | No wallet disconnect button | Added dropdown menu on connected wallet button with "Open Vault" and "Disconnect" options | [`9762c5d`](https://github.com/Atharvashind/treasury-vault/commit/9762c5d998539dec21efc139c861513d7169ad60) |
| 4 | Insufficient balance throws unreadable error | Added human-readable error messages mapped to each `VaultError` contract code (e.g. "Insufficient shares — you don't have enough MVLT to withdraw that amount") | [`9762c5d`](https://github.com/Atharvashind/treasury-vault/commit/9762c5d998539dec21efc139c861513d7169ad60) |
| 5 | "Login / Sign in" button is confusing | Renamed to "Connect Wallet" for clarity | [`9762c5d`](https://github.com/Atharvashind/treasury-vault/commit/9762c5d998539dec21efc139c861513d7169ad60) |

---

## Live Contract

| Network | Contract ID |
|---------|-------------|
| Stellar Testnet | `CBN4ZR3FTJFIOISCWVF27GXUDAFLNSMVP6BTOWPBEBKES2VOIHS2HS6J` |
| Token (XLM SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Rust · Soroban SDK v22 |
| Frontend | Next.js 14 (App Router) · TypeScript |
| Styling | Tailwind CSS |
| Wallet | Freighter Browser Extension |
| Network | Stellar Testnet |

---

## Architecture

```
Browser (Client)
  ├── Freighter API     — wallet connection & transaction signing
  └── Next.js App       — UI, routing, state

Next.js API Routes (Server)
  ├── /api/vault/info         — fetch vault state
  ├── /api/vault/shares       — fetch user share balance
  ├── /api/vault/build-tx     — build & simulate transaction
  ├── /api/vault/submit       — submit signed transaction + human errors
  ├── /api/vault/events       — fetch on-chain events (raw JSON-RPC)
  └── /api/vault/rebalance-sign — build rebalance transaction

Soroban Contract (On-chain)
  ├── initialize(admin, token)
  ├── deposit(from, amount)   — mint shares
  ├── withdraw(to, shares)    — burn shares
  ├── rebalance()             — accrue yield (admin only)
  ├── get_vault_info()        — read vault state
  └── get_user_shares(user)   — read user balance
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Rust + `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli)
- [Freighter Wallet](https://freighter.app) browser extension

### Frontend

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

### Smart Contract

```bash
cd contracts/monolith-vault
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/monolith_vault.wasm \
  --source YOUR_KEY \
  --network testnet
```

---

## Environment Variables

```env
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_VAULT_CONTRACT_ID=your_contract_id
NEXT_PUBLIC_TOKEN_CONTRACT_ID=your_token_contract_id
NEXT_PUBLIC_VAULT_ADMIN_ADDRESS=your_admin_address
VAULT_ADMIN_ADDRESS=your_admin_address
```

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

1. Lint & TypeScript check on every push/PR
2. Next.js production build
3. Soroban WASM compilation
4. Vercel deploy on `main`

---

## License

MIT
