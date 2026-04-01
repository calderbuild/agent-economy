# AgentEconomy

A complete agent economic loop on Kite Chain where AI agents **earn money** by completing tasks AND **spend money** buying tools -- all settled via x402/USDC micropayments with on-chain attestations.

## The Problem

Every agentic commerce project shows agents spending money. But a real economy needs both sides. AgentEconomy demonstrates a self-sustaining **closed economic loop** where agents are full economic participants.

## How It Works

```
Human posts task ($1 bounty)
    |
Agent accepts task
    |
Agent buys tools via x402 micropayments
    |- Stock Data API ($0.10)
    |- Chart Generation ($0.05)
    |- Web Search ($0.05)
    |
Agent synthesizes result
    |
Human approves -> Agent receives $1
    |
Agent profit: $1.00 - $0.20 = $0.80
    |
All transactions attested on Kite Chain
```

## Architecture

- **Backend**: Express + x402 payment middleware (Kite testnet, Pieverse facilitator)
- **5 Paid Tool APIs**: Stock data, web search, chart generation, translation, news
- **Task Board**: Full lifecycle -- create, accept, submit, approve/reject
- **AI Agent**: Autonomous planning, tool calling, result synthesis
- **Dashboard**: Real-time Next.js frontend with terminal finance aesthetic
- **On-chain**: Solidity attestation contract on Kite Chain (EIP-155:2368)

## Quick Start

```bash
# 1. Install
npm install
cd frontend && npm install && cd ..

# 2. Configure
cp .env.example .env
# Edit .env with your keys

# 3. Run backend
npm run dev:server

# 4. Run frontend (separate terminal)
cd frontend && npm run dev -- -p 3021

# 5. Run agent (separate terminal)
npm run dev:agent
```

Dashboard at `http://localhost:3021`, API at `http://localhost:4021`.

## Deploy Attestation Contract

```bash
# Fund wallet from https://faucet.gokite.ai/
npx hardhat run scripts/deploy.ts --network kiteTestnet
# Add contract address to .env as ATTESTATION_CONTRACT_ADDRESS
```

## Kite Chain Integration

| Component | Detail |
|-----------|--------|
| Chain | Kite Testnet (Chain ID 2368) |
| RPC | https://rpc-testnet.gokite.ai/ |
| Explorer | https://testnet.kitescan.ai/ |
| Payment | x402 protocol via Pieverse facilitator |
| Token | Test USDT (0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63) |
| Attestation | Custom Solidity contract emitting Attestation events |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript |
| Payment | @x402/express, @x402/fetch, @x402/evm |
| Frontend | Next.js 14, Tailwind CSS |
| Agent | Claude API (with keyword fallback) |
| Database | SQLite (better-sqlite3) |
| Smart Contract | Solidity 0.8.24, Hardhat |
| Chain | Kite Testnet (Avalanche subnet) |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /tools/discover` | List available paid tools |
| `GET /tasks` | List tasks |
| `POST /tasks` | Create bounty task |
| `POST /tasks/:id/accept` | Agent accepts task |
| `POST /tasks/:id/submit` | Agent submits result |
| `POST /tasks/:id/approve` | Approve and pay agent |
| `GET /tasks/api/metrics` | Economy metrics |
| `GET /tasks/api/activity` | Activity feed |
| `GET /tasks/api/transactions` | Transaction log |

## Hackathon Requirements

- [x] AI agent performs task and settles on Kite chain
- [x] Executes paid actions via x402
- [x] End-to-end live demo
- [x] Uses Kite chain for attestations
- [x] Functional UI (web dashboard)
- [x] Demo publicly accessible

## License

MIT
