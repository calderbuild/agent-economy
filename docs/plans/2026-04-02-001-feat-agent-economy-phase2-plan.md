---
title: "feat: AgentEconomy Phase 2 - Real Payments, Polish, and Submission"
type: feat
status: active
date: 2026-04-02
origin: docs/plans/2026-04-01-001-feat-agent-economy-implementation-plan.md
hackathon_deadline: 2026-04-26
---

# AgentEconomy Phase 2 - Real Payments, Polish, and Submission

## Overview

Phase 1 built a complete agent economic loop with mocked payments. Phase 2 makes it real: actual x402 USDT transactions on Kite chain, production deployment with verified on-chain attestations, and a polished demo video. The goal is a hackathon submission where judges can see real money flowing on Kitescan.

## Problem Frame

The current MVP has one critical gap: **all payments are simulated**. The agent bypasses x402 by catching 402 responses and returning mock data. Task approval records a database entry but doesn't settle USDT. This means the "economy" is theater, not reality. Judges will check Kitescan -- they need to see real transactions.

Secondary gaps: agent identity is malformed (`0xAgent_` prefix), no real Claude API integration tested in production, SQLite won't persist across Render deploys, and no demo video exists.

## Requirements Trace

- R1. Real x402 USDT payments between agent and tool APIs on Kite chain (hackathon requirement: "settles on Kite chain")
- R2. Real x402 payment from task creator to agent on task approval (hackathon requirement: "executes paid actions")
- R3. On-chain attestations visible on Kitescan (hackathon requirement: "uses Kite chain for attestations")
- R4. Production deployment accessible to judges (hackathon requirement: "end-to-end live demo in production")
- R5. 3-minute demo video showing real transactions (hackathon requirement: "demo publicly accessible")
- R6. Agent uses real Ethereum address for identity traceability
- R7. Claude API integration tested and working in production

## Scope Boundaries

- NOT adding new features (no new tool APIs, no multi-agent, no governance)
- NOT migrating off SQLite (Render persistent disk is sufficient for hackathon)
- NOT implementing real x402 for task-creator-to-platform payments (only agent-to-tool and platform-to-agent)
- NOT building mobile responsive (desktop demo only)
- NOT writing automated tests (hackathon context, manual E2E validation)

## Key Technical Decisions

- **Verify USDT decimals before any payment code:** Kite Test USDT at `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63` may use 6 or 18 decimals. Wrong decimals = wrong amounts = failed payments. Check on Kitescan first.
- **x402 fetch wrapper for agent tool calls:** Replace the mock bypass in `tool-caller.ts` with `wrapFetchWithPaymentFromConfig` from `@x402/fetch`. This handles 402 detection, payment signing, and retry automatically.
- **Keep mock fallback as safety net:** If x402 payment fails (insufficient funds, facilitator down), fall back to mock data with a warning log. Demo reliability > payment purity.
- **Render persistent disk for SQLite:** Instead of migrating to PostgreSQL, mount a persistent disk on Render. Simpler, no migration needed, sufficient for hackathon.
- **Demo video recorded locally, not in production:** More control over timing, can retry segments, avoid Render cold-start delays.

## Open Questions

### Resolved During Planning

- **Q: Can Pieverse facilitator actually settle x402 on Kite testnet?**
  Resolution: Yes, confirmed working. TX `0x78e3098d...` was a real attestation on Kite testnet via the server's ethers.js integration. Facilitator at `facilitator.pieverse.io` supports `eip155:2368`.

- **Q: How much KITE do we need for gas?**
  Resolution: 0.5 KITE is sufficient. The attestation TX used 0.0000000049 KITE gas. Even 100 attestations would use negligible gas.

### Deferred to Implementation

- Exact USDT decimals on Kite testnet (must check on-chain before writing payment code)
- Whether `transferWithAuthorization` (EIP-3009) or Permit2 is needed for Kite Test USDT
- Whether faucet dispenses Test USDT or only KITE (may need to find USDT separately)

## Hackathon Timeline

| Week | Dates | Focus | Milestone |
|------|-------|-------|-----------|
| Week 2 | Apr 7-13 | Real x402 payments + agent identity | Mid-hackathon: working real payments |
| Week 3 | Apr 14-20 | Production deploy + E2E testing | All on-chain, publicly accessible |
| Week 4 | Apr 21-26 | Demo video + final polish + submit | **Apr 26: Final submission** |

## Implementation Units

### Week 2: Make Payments Real

- [ ] **Unit 1: Verify USDT Token and Fund Wallets**

**Goal:** Determine USDT decimals, fund agent wallet with USDT, ensure enough KITE for gas.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Create: `src/scripts/check-token.ts` (query USDT contract for decimals, name, symbol)
- Modify: `src/shared/x402-helpers.ts` (fix decimals if needed)

**Approach:**
- Use ethers.js to call `decimals()` on the USDT contract
- Visit Kite faucet to get USDT tokens (if faucet supports it)
- If faucet doesn't give USDT, explore Kite Discord for testnet USDT
- Fund both agent wallet and server wallet

**Verification:**
- Agent wallet has USDT balance visible on Kitescan
- `kitePrice()` helper uses correct decimals

---

- [ ] **Unit 2: Fix Agent Identity**

**Goal:** Agent uses real Ethereum address derived from private key.

**Requirements:** R6

**Dependencies:** None

**Files:**
- Modify: `src/agent/index.ts` (derive real address from private key using ethers.Wallet)

**Approach:**
- Replace `"0xAgent_" + config.agentPrivateKey.slice(2, 10)` with `new ethers.Wallet(config.agentPrivateKey).address`
- Agent address will be a valid 42-char hex address traceable on Kitescan

**Verification:**
- Agent logs show real Ethereum address (0x854d98...)
- Attestations on Kitescan link to real agent address

---

- [ ] **Unit 3: Real x402 Tool Payments**

**Goal:** Agent actually pays USDT via x402 when calling tool APIs, not mock bypass.

**Requirements:** R1

**Dependencies:** Unit 1 (funded wallet), Unit 2 (real address)

**Files:**
- Modify: `src/agent/tool-caller.ts` (replace mock bypass with x402 fetch wrapper)
- Modify: `src/agent/index.ts` (initialize x402 client once, pass to tool caller)

**Approach:**
- Create x402 fetch client using `wrapFetchWithPaymentFromConfig` with agent's private key
- Tool caller uses x402 fetch for all tool calls
- If x402 payment succeeds: return real tool response
- If x402 payment fails (insufficient funds, network error): fall back to mock with warning log
- Record tx_hash from x402 response headers (if available) in tool purchase transaction

**Verification:**
- Agent calls tool API, gets 402, pays via x402, receives 200 with real data
- USDT transfer visible on Kitescan
- Transaction log in dashboard shows real tx_hash

---

- [ ] **Unit 4: Real Task Bounty Payment**

**Goal:** When human approves task, platform actually pays agent USDT via x402.

**Requirements:** R2

**Dependencies:** Unit 1 (funded platform wallet)

**Files:**
- Modify: `src/server/routes/tasks.ts` (add x402 payment call on approve)
- Create: `src/server/services/payment.ts` (x402 payment helper for server-to-agent transfers)

**Approach:**
- On task approval, server signs an x402 payment from platform wallet to agent address
- This requires server to have a funded USDT balance
- If payment succeeds: record real tx_hash in transaction table
- If payment fails: still mark task as completed but flag payment as pending
- This is the "agent earns money" half of the economic loop

**Verification:**
- Approve task -> real USDT transfer on Kitescan
- Agent's USDT balance increases
- Transaction log shows real tx_hash with Kitescan link

---

### Week 3: Deploy and Validate

- [ ] **Unit 5: Production Database Persistence**

**Goal:** SQLite database survives Render redeploys.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `src/server/db/index.ts` (use persistent path from env var)
- Modify: `render.yaml` (add persistent disk mount)

**Approach:**
- Add `disk` config in render.yaml pointing to `/data`
- Set env var `DB_PATH=/data/agent-economy.db`
- Update db/index.ts to use `process.env.DB_PATH` if set

**Verification:**
- Create task on production, redeploy service, task still exists

---

- [ ] **Unit 6: Production E2E Validation**

**Goal:** Full demo flow works in production with real on-chain transactions.

**Requirements:** R1, R2, R3, R4

**Dependencies:** Units 1-5

**Files:**
- Create: `src/scripts/demo-flow.ts` (automated demo script that runs against production)

**Approach:**
- Script posts a task via API
- Starts agent pointing at production backend
- Agent accepts, buys tools (real x402), submits
- Script approves task (real x402 payment to agent)
- Script verifies all transactions on Kitescan via explorer API
- Run 5+ times to ensure reliability

**Verification:**
- 5 consecutive successful demo runs in production
- All transactions verifiable on Kitescan
- Dashboard shows real data with Kitescan links

---

- [ ] **Unit 7: Dashboard Kitescan Links**

**Goal:** Transaction log links to real Kitescan TX pages.

**Requirements:** R3

**Dependencies:** Unit 3, Unit 4 (real tx_hashes in database)

**Files:**
- Modify: `frontend/app/components/TransactionLog.tsx` (add Kitescan link when tx_hash exists)

**Approach:**
- If transaction has tx_hash, render as clickable link to `https://testnet.kitescan.ai/tx/{tx_hash}`
- If no tx_hash, show "pending" or "local"

**Verification:**
- Transaction log shows clickable Kitescan links
- Links open correct TX on Kitescan

---

### Week 4: Demo Video and Submission

- [ ] **Unit 8: Demo Video Recording**

**Goal:** Record a compelling 3-minute demo video.

**Requirements:** R5

**Dependencies:** Units 1-7 (everything working in production)

**Files:**
- Create: `docs/DEMO_SCRIPT.md` (detailed narration script)

**Approach:**
- **[0:00-0:20] Hook:** "AI agents can spend money. But can they earn it?"
- **[0:20-0:40] Problem:** Show agent stuck at API signup page concept
- **[0:40-1:00] Solution:** AgentEconomy architecture (dashboard empty state)
- **[1:00-2:30] Live demo:** Post task -> agent accepts -> buys 3 tools (show x402 payments) -> submits report -> approve -> show Kitescan attestation
- **[2:30-3:00] Impact:** "Agents that earn, spend, and profit. All on Kite Chain."
- Record with OBS or QuickTime, voiceover, upload to YouTube

**Verification:**
- Video under 3 minutes
- Shows real Kitescan transactions
- Clear audio, no dead time

---

- [ ] **Unit 9: Final Submission**

**Goal:** Submit project on Encode Club portal before April 26 23:59 UTC-12.

**Requirements:** All

**Dependencies:** Unit 8 (demo video uploaded)

**Files:**
- Modify: `README.md` (add demo video link, final architecture diagram)

**Approach:**
- Update Encode Club project with:
  - Demo video URL
  - GitHub repo link
  - Live demo URL (Vercel + Render)
  - Attestation contract address
  - Kitescan links to real transactions
- Verify all hackathon requirements checklist:
  - [x] AI agent performs task and settles on Kite chain
  - [x] Executes paid actions via x402
  - [x] End-to-end live demo in production
  - [x] Uses Kite chain for attestations
  - [x] Functional UI (web dashboard)
  - [x] Demo publicly accessible

**Verification:**
- Submission visible on hackathon portal
- All links work
- Demo video plays correctly

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Kite faucet doesn't dispense USDT | Medium | Critical | Ask in Kite Discord, try alternative faucets, or find USDT bridge |
| x402 payment fails with EIP-3009 on Kite USDT | Medium | High | Try Permit2 fallback (`assetTransferMethod: "permit2"` in x402 config) |
| Render cold starts delay demo | Low | Medium | Keep service warm with cron ping, or use paid plan |
| Kite testnet instability during demo recording | Low | High | Record demo locally against localhost, show Kitescan links separately |
| Agent Claude API rate limited during demo | Low | Medium | Have backup demo with keyword planner (still works, just less impressive) |

## Sources & References

- **Phase 1 plan:** `docs/plans/2026-04-01-001-feat-agent-economy-implementation-plan.md`
- **x402 SDK:** https://github.com/coinbase/x402
- **Kite testnet:** Chain ID 2368, RPC: https://rpc-testnet.gokite.ai/
- **Attestation contract:** `0x439Ea30758B27dc07B76EFB4dA9311A011B7554E`
- **Kitescan:** https://testnet.kitescan.ai/
- **Pieverse facilitator:** https://facilitator.pieverse.io
- **Production frontend:** https://frontend-gilt-nu-30.vercel.app
- **Production backend:** https://agent-economy-api.onrender.com
- **GitHub:** https://github.com/calderbuild/agent-economy
