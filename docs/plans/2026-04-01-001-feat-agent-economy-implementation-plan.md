---
title: "feat: AgentEconomy - Kite Chain Agent Micro-Economy Platform"
type: feat
status: active
date: 2026-04-01
track: Agentic Commerce
hackathon: Kite AI Global Buildathon 2026
solo_dev: true
timeline: 3.5 weeks remaining (April 1 - April 26)
prize_target: 1st place ($5,000)
---

# AgentEconomy - Kite Chain Agent Micro-Economy Platform

## Overview

A complete agent economic loop on Kite chain where AI Agents earn money by completing bounty tasks AND spend money buying tools/data to fulfill those tasks. All transactions settle via x402/USDC on Kite chain with on-chain attestations. This demonstrates a self-sustaining "agentic economy" -- directly embodying the hackathon theme.

## Problem Frame

**The one-sided agent narrative:** Every existing agentic commerce project shows agents SPENDING money (buying APIs, products, services). But a real economy requires both sides -- agents that earn AND spend. Nobody has demonstrated a closed economic loop where agents are economic participants, not just consumers.

**Why this matters:**
- The freelance/gig market is $1.5T+ globally
- AI agents are already replacing low-end freelance work (research, data analysis, content creation)
- But there's no infrastructure for agents to receive payment for completed work
- x402 enables frictionless machine-to-machine payments in BOTH directions
- Kite chain provides verifiable identity (Agent Passport) and audit trail (attestations)

**Evidence this is real:**
- x402 has processed 75M+ transactions in last 30 days ($24M volume) -- machine-to-machine payments work
- 57% of enterprises have agents in production (LangChain survey) -- agents doing real work
- ChatGPT Instant Checkout shut down after 6 months -- consumer agent commerce failed, but B2B/API payments are thriving
- McKinsey identifies agentic commerce as breakout trend -- but only the machine-to-machine slice has traction

## Requirements Trace

- R1. AI agent performs task and settles on Kite chain (hackathon requirement)
- R2. Executes paid actions via x402 (hackathon requirement)
- R3. End-to-end live demo in production (hackathon requirement)
- R4. Uses Kite chain for attestations (hackathon requirement)
- R5. Functional UI - web dashboard (hackathon requirement)
- R6. Demo publicly accessible (hackathon requirement)
- R7. Agent demonstrates BOTH earning and spending (project differentiator)
- R8. Agent autonomy -- minimal human involvement (judging criterion)
- R9. Real-world applicability (judging criterion)
- R10. Novel/creative approach (judging criterion)

## Scope Boundaries

**In scope (MVP):**
- Task board: humans post bounty tasks, agents accept and complete
- 3-5 paid tool APIs behind x402 paywall (stock data, web search, chart generation, etc.)
- 1 AI agent (Claude API-powered) that autonomously accepts tasks, buys tools, delivers results
- Next.js dashboard showing economy in real-time (tasks, payments, profits, attestations)
- Kite chain attestation logging (simple contract)
- Agent Passport integration for agent identity (if docs sufficient, otherwise mock identity)
- Production deployment on Vercel + cloud backend

**Explicitly out of scope:**
- Smart contract escrow (MVP uses server-side payment flow)
- Multiple competing agents / bidding protocol
- gokite-aa-sdk integration (near-zero adoption, use standard ethers.js instead)
- Python SDK
- Advanced governance (spending limits, whitelists)
- Multi-chain support
- Complex negotiation between agents

## Context & Research

### Relevant Code and Patterns

No existing codebase -- greenfield project. Reference implementations:
- `github.com/coinbase/x402` -- x402 SDK examples (TypeScript server/client, Express middleware)
- `github.com/gokite-ai/kite_counter_dapp` -- Kite chain sample dApp (React + Vite + ethers.js)
- Kite testnet RPC: `https://rpc-testnet.gokite.ai/` (Chain ID 2368)
- Kite faucet: `https://faucet.gokite.ai/`
- Kite explorer: `https://testnet.kitescan.ai/`
- Test USDT: `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`

### Research Findings

**x402 SDK maturity (STRONG):**
- 5,830 GitHub stars, actively maintained
- TypeScript packages: `@x402/core`, `@x402/express`, `@x402/fetch`, `@x402/next`
- Server-side: 1 middleware line adds x402 paywall to any Express route
- Client-side: 1 wrapper around fetch/axios handles 402 responses automatically
- Facilitators: Coinbase CDP (more stable), Pieverse (Kite-specific)

**Kite chain (USABLE):**
- EVM-compatible Avalanche subnet -- standard Solidity, ethers.js, Hardhat all work
- Testnet with faucet (free KITE + USDT tokens)
- Explorer works (Kitescan)
- Docs incomplete but core network info available

**Agent Passport (UNCLEAR):**
- MCP-based identity system documented conceptually
- MCP Server: `https://neo.dev.gokite.ai/v1/mcp`
- Tools: `get_payer_addr`, `approve_payment`
- Portal: `https://x402-portal-eight.vercel.app/`
- Actual SDK usability unknown -- plan for fallback to simpler identity

**Hackathon competition (FAVORABLE):**
- $10K total prize pool, likely small participant pool (niche ecosystem)
- Competition from airdrop farmers more than serious developers
- Deep sponsor tech integration = major judging advantage
- Judges from Microsoft, Uber, Nvidia, Meta, Google DeepMind, Academia

### Hackathon Winner Patterns (from research)

1. **Execution > Innovation:** One working feature beats five half-baked ones
2. **Demo video is #1 submission artifact** -- judges see it first
3. **3-minute rule:** Can't explain in 3 minutes = too complex
4. **Deep sponsor tech usage** = bounty prizes
5. **UX quality** stands out dramatically in Web3 hackathons (typically terrible)
6. **Narrative matters:** Clear problem → solution → live demo → impact
7. **"Wow" moment in first 60 seconds** determines if judges pay attention

## Key Technical Decisions

- **Express over Next.js API routes for backend:** x402 SDK has official Express middleware (`@x402/express`), fastest integration path. Frontend in Next.js, backend in separate Express server.
- **Standard ethers.js over gokite-aa-sdk:** AA SDK has ~1100 total downloads, near-zero community. ethers.js is battle-tested and works directly with Kite's EVM-compatible chain.
- **Server-side task payment flow over smart contract escrow:** For MVP, the server holds task payment state and triggers x402 payment to agent on task approval. Avoids the complexity and risk of writing/auditing a custom escrow contract in 3 weeks. Smart contract is used ONLY for attestation logging (low risk, simple logic).
- **Claude API for agent reasoning:** Native MCP support, best multi-step reasoning, Anthropic is related to the judge ecosystem. OpenAI as fallback.
- **Supabase for database:** Free tier, real-time subscriptions for dashboard updates, PostgreSQL for relational queries.
- **Vercel + Railway for deployment:** Vercel for Next.js frontend (zero-config), Railway for Express backend (simple Node.js deploy). Both have free tiers.
- **Mock tool APIs rather than integrating real third-party APIs:** Control quality and reliability of demo. Each tool API is a simple Express route with x402 paywall that returns realistic data. Can integrate real APIs later but demo reliability is paramount.

## Open Questions

### Resolved During Planning

- **Q: Should we use Agent Passport or mock identity?**
  Resolution: Try Agent Passport first (Week 1 Day 1-2). If docs are insufficient or integration is too complex, fall back to simple wallet-address-based identity. Either way, the agent has a Kite chain address as identity.

- **Q: Which x402 facilitator to use?**
  Resolution: Start with Coinbase CDP facilitator (more stable, 1000 free tx/month). If Kite-specific integration is required for judging, switch to Pieverse facilitator.

- **Q: SQLite or PostgreSQL?**
  Resolution: Supabase (PostgreSQL). Real-time subscriptions enable live dashboard updates without polling. Free tier is sufficient.

### Deferred to Implementation

- Exact data format for attestation events on chain (depends on what Kitescan can display nicely)
- Whether Agent Passport MCP integration works smoothly (fallback plan ready)
- Specific Claude API prompt engineering for task planning (iterative during implementation)
- Exact tool API response formats (designed during tool API implementation)

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
                         Human User
                             |
                    [Post Task + Bounty]
                             |
                             v
+----------------------------------------------------------+
|                    AgentEconomy Platform                  |
|                                                          |
|  +------------------+      +------------------------+    |
|  | Task Board API   |      | Tool APIs (x402)       |   |
|  | - POST /tasks    |      | - /tools/stock-data    |   |
|  | - GET /tasks     |      | - /tools/web-search    |   |
|  | - POST /submit   |      | - /tools/chart-gen     |   |
|  | - POST /approve  |      | - /tools/translate     |   |
|  +--------+---------+      +----------+--------------+   |
|           |                            |                  |
|           v                            v                  |
|  +------------------------------------------+            |
|  |           AI Agent (Claude API)           |            |
|  |  1. Poll task board for available tasks   |            |
|  |  2. Evaluate: can I do this? profitable?  |            |
|  |  3. Accept task                           |            |
|  |  4. Plan: which tools do I need?          |            |
|  |  5. Call paid tools via x402 ($$$  out)   |            |
|  |  6. Synthesize result                     |            |
|  |  7. Submit result                         |            |
|  |  8. Receive payment via x402 ($$$ in)     |            |
|  +------------------------------------------+            |
|           |                                               |
+----------------------------------------------------------+
            |
            v
+----------------------------------------------------------+
|                     Kite Chain (2368)                     |
|  - USDT settlement (x402)                                |
|  - Attestation contract (task hash, payment, timestamp)  |
|  - Agent identity (Passport or wallet address)           |
|  - Viewable on Kitescan                                  |
+----------------------------------------------------------+
            |
            v
+----------------------------------------------------------+
|                   Next.js Dashboard                      |
|  - Live task feed (posted, in-progress, completed)       |
|  - Agent activity stream (tools called, payments made)   |
|  - Economy metrics (total volume, agent profit, costs)   |
|  - Transaction log with Kitescan links                   |
|  - Cost breakdown per task (earned - spent = profit)     |
+----------------------------------------------------------+
```

**Payment flow detail:**

```
Task Creator                Agent                 Tool API             Kite Chain
    |                         |                      |                     |
    |-- POST /tasks ($1) ---->|                      |                     |
    |                         |-- GET /tasks -------->                     |
    |                         |-- Accept task ------->                     |
    |                         |                      |                     |
    |                         |-- GET /tools/stock -->|                     |
    |                         |<-- 402 Pay Required --|                     |
    |                         |-- Pay $0.10 (x402) ->|                     |
    |                         |<-- 200 + data -------|-- settle USDT ----->|
    |                         |                      |-- attestation ----->|
    |                         |                      |                     |
    |                         |-- GET /tools/chart -->|                     |
    |                         |<-- 402 Pay Required --|                     |
    |                         |-- Pay $0.05 (x402) ->|                     |
    |                         |<-- 200 + chart ------|-- settle USDT ----->|
    |                         |                      |-- attestation ----->|
    |                         |                      |                     |
    |<-- Submit result -------|                      |                     |
    |-- Approve (pay $1) ---->|                      |                     |
    |                         |<-- Receive $1 (x402)-|-- settle USDT ----->|
    |                         |                      |-- attestation ----->|
    |                         |                      |                     |
    |   Agent profit: $1.00 - $0.10 - $0.05 = $0.85                      |
```

## Implementation Units

### Phase 1: Foundation (April 1-8) -- Milestone 1 Deadline April 6

- [ ] **Unit 1: Project Setup + x402 Payment Flow**

**Goal:** Establish project structure and prove x402 payments work end-to-end on Kite chain.

**Requirements:** R1, R2

**Dependencies:** None

**Files:**
- Create: `package.json`, `tsconfig.json`, `.env.example`
- Create: `src/server/index.ts` (Express server entry)
- Create: `src/server/middleware/x402.ts` (x402 payment middleware config)
- Create: `src/server/routes/demo-paid-endpoint.ts` (test x402 paywall)
- Create: `src/client/x402-client.ts` (x402 payment client wrapper)
- Test: Manual e2e test -- client pays server via x402, USDT settles on Kite testnet

**Approach:**
- Initialize monorepo with TypeScript, Express backend, shared types
- Install `@x402/express` (server), `@x402/fetch` (client), `ethers` (chain)
- Create one test endpoint behind x402 paywall
- Verify payment settles on Kite testnet via Kitescan
- Determine which facilitator works (Coinbase CDP vs Pieverse)

**Patterns to follow:**
- x402 Express examples from `github.com/coinbase/x402/examples/typescript`
- Kite testnet connection from `github.com/gokite-ai/kite_counter_dapp`

**Test scenarios:**
- Happy path: Client calls paid endpoint, receives 402, pays via x402, receives 200 response, USDT deducted from client wallet, credited to server wallet, transaction visible on Kitescan
- Error path: Client calls paid endpoint with insufficient USDT balance, receives 402, payment fails gracefully with clear error
- Error path: Facilitator is unreachable, request times out with informative error (not silent hang)

**Verification:**
- A single x402 payment completes successfully on Kite testnet
- Transaction visible on Kitescan explorer
- Both client and server wallets show correct USDT balance changes

---

- [ ] **Unit 2: Tool APIs with x402 Paywall**

**Goal:** Create 3-5 mock tool APIs that agents can pay to use, each behind x402 paywall.

**Requirements:** R2, R7, R9

**Dependencies:** Unit 1

**Files:**
- Create: `src/server/routes/tools/stock-data.ts` ($0.10/call)
- Create: `src/server/routes/tools/web-search.ts` ($0.05/call)
- Create: `src/server/routes/tools/chart-gen.ts` ($0.05/call)
- Create: `src/server/routes/tools/translate.ts` ($0.02/call)
- Create: `src/server/routes/tools/news.ts` ($0.03/call)
- Create: `src/server/routes/tools/index.ts` (tool registry/discovery endpoint)
- Test: Each tool returns 402, accepts x402 payment, returns realistic data

**Approach:**
- Each tool is an Express route with x402 middleware specifying price
- Tool discovery endpoint (`GET /tools`) returns available tools with capabilities and pricing (no auth required)
- Tool responses return realistic mock data (not lorem ipsum -- use real-looking stock prices, news headlines, etc.)
- Chart generation tool returns actual Chart.js-rendered PNG (or SVG) -- visually impressive in demo

**Patterns to follow:**
- x402 Express middleware pattern from Unit 1
- RESTful API design

**Test scenarios:**
- Happy path: Agent calls `GET /tools` to discover available tools, sees 5 tools with descriptions and pricing
- Happy path: Agent calls `GET /tools/stock-data?symbol=TSLA` with x402 payment, receives realistic stock data JSON
- Happy path: Agent calls `POST /tools/chart-gen` with data payload and x402 payment, receives chart image
- Edge case: Agent calls tool with missing required parameters, receives 400 with clear error message (not 402)
- Error path: Agent calls non-existent tool, receives 404

**Verification:**
- All 5 tool APIs work behind x402 paywall
- Tool discovery endpoint returns complete tool catalog
- Each tool returns visually convincing mock data

---

- [ ] **Unit 3: Task Board API**

**Goal:** Create the bounty task board where humans post tasks and agents submit results.

**Requirements:** R7, R8, R9

**Dependencies:** Unit 1

**Files:**
- Create: `src/server/routes/tasks.ts` (task CRUD + submission + approval)
- Create: `src/server/models/task.ts` (task data model)
- Create: `src/server/db/index.ts` (Supabase client setup)
- Create: `src/server/db/schema.sql` (tasks, submissions, transactions tables)
- Test: Full task lifecycle via API calls

**Approach:**
- `POST /tasks` -- create task with description, bounty amount, required capabilities
- `GET /tasks` -- list available tasks (filterable by status: open, in_progress, completed)
- `POST /tasks/:id/accept` -- agent accepts task (changes status to in_progress)
- `POST /tasks/:id/submit` -- agent submits result (markdown text + metadata)
- `POST /tasks/:id/approve` -- human approves result, triggers x402 payment to agent
- `POST /tasks/:id/reject` -- human rejects, task goes back to open
- Task states: open -> in_progress -> submitted -> completed/rejected
- Store task data in Supabase PostgreSQL
- Real-time updates via Supabase subscriptions (for dashboard later)

**Patterns to follow:**
- Standard REST API with state machine pattern
- Supabase client library for PostgreSQL + real-time

**Test scenarios:**
- Happy path: Create task -> agent accepts -> agent submits -> human approves -> task completed, payment triggered
- Edge case: Agent accepts task that's already accepted by another -> returns 409 Conflict
- Edge case: Submit result for task not in_progress state -> returns 400
- Error path: Approve task but agent wallet is unreachable -> mark payment as pending, retry

**Verification:**
- Full task lifecycle works via API
- Task state transitions are enforced
- Real-time updates propagate to Supabase subscribers

---

- [ ] **Unit 4: AI Agent Core Loop**

**Goal:** Build the AI agent that autonomously polls tasks, plans execution, calls paid tools, and submits results.

**Requirements:** R7, R8, R10

**Dependencies:** Unit 2, Unit 3

**Files:**
- Create: `src/agent/index.ts` (agent main loop)
- Create: `src/agent/planner.ts` (Claude API task planning)
- Create: `src/agent/tool-caller.ts` (x402 tool invocation)
- Create: `src/agent/executor.ts` (orchestrate plan execution)
- Test: Agent completes a full task end-to-end autonomously

**Approach:**
- Agent runs as a separate Node.js process
- Main loop: poll task board (every 5s) -> evaluate task -> accept if capable -> plan execution -> call tools -> synthesize result -> submit
- Planning step: Send task description to Claude API, ask it to identify which tools are needed and in what order
- Tool calling: Use x402 fetch client to call each tool API, pay automatically
- Result synthesis: Send tool outputs back to Claude API, ask it to compile final result
- Agent tracks its own economics: money received (task bounties) vs money spent (tool calls) = profit
- All agent actions logged to database for dashboard display

**Patterns to follow:**
- Simple polling loop (not WebSocket -- reliability over elegance for hackathon)
- Claude API tool_use for structured planning
- x402 fetch wrapper from Unit 1

**Test scenarios:**
- Happy path: Post "Analyze Tesla stock" task -> Agent discovers it, accepts, calls stock-data + chart-gen tools, pays for both, synthesizes report with chart, submits result
- Happy path: Agent correctly identifies which tools it needs based on task description (doesn't call irrelevant tools)
- Edge case: Agent encounters a task requiring a tool it can't afford (insufficient balance) -> declines task or reports partial result
- Error path: Tool API call fails mid-execution -> Agent handles gracefully, reports what it completed and what failed

**Verification:**
- Agent autonomously completes a research task end-to-end
- Agent calls appropriate paid tools and pays via x402
- Agent submits coherent result synthesized from tool outputs
- Agent economic tracking shows correct income/expenses/profit

---

**Milestone 1 Deliverable (April 6): Submit project outline on hackathon portal.**
Use this plan as basis. Core pitch: "AgentEconomy -- a complete agent economic loop where AI agents earn AND spend on Kite chain."

---

### Phase 2: Chain Integration + Frontend (April 9-16)

- [ ] **Unit 5: Kite Chain Attestation Contract**

**Goal:** Deploy a simple Solidity contract that logs economic events as on-chain attestations.

**Requirements:** R1, R4

**Dependencies:** Unit 1

**Files:**
- Create: `contracts/AgentEconomyAttestation.sol`
- Create: `scripts/deploy.ts` (Hardhat deploy script)
- Create: `src/server/services/attestation.ts` (server-side contract interaction)
- Test: Deploy to Kite testnet, log an event, verify on Kitescan

**Approach:**
- Minimal Solidity contract with one function: `logAttestation(bytes32 taskHash, address agent, uint256 amount, string calldata attestationType)`
- Attestation types: "task_completed", "tool_purchased", "payment_received"
- Emit events that Kitescan can index and display
- Server calls this contract after each x402 payment settles
- Use Hardhat for compilation and deployment (standard EVM tooling works on Kite)

**Patterns to follow:**
- Kite counter dApp sample for chain connection config
- Standard Hardhat deployment scripts

**Test scenarios:**
- Happy path: Deploy contract to Kite testnet, call `logAttestation` with valid parameters, event emitted and visible on Kitescan
- Happy path: Multiple attestations from different transactions all show up in Kitescan under the contract address
- Error path: Contract call with insufficient gas -> fails with clear error, does not block the main payment flow

**Verification:**
- Contract deployed to Kite testnet
- Attestation events visible on Kitescan with correct data
- Server can call contract programmatically after each x402 transaction

---

- [ ] **Unit 6: Agent Passport Integration (or Fallback)**

**Goal:** Give the agent a verifiable on-chain identity using Kite Agent Passport.

**Requirements:** R8, R10

**Dependencies:** Unit 1

**Files:**
- Create: `src/server/services/agent-identity.ts` (passport integration or wallet-based identity)
- Modify: `src/agent/index.ts` (agent uses identity for all interactions)
- Test: Agent has a verifiable identity that appears in attestations

**Approach:**
- Attempt 1: Integrate Agent Passport via MCP (`https://neo.dev.gokite.ai/v1/mcp`), use `get_payer_addr` and `approve_payment` tools
- If Agent Passport integration works -> use it for agent identity and x402 payments
- Fallback: Generate a standard Ethereum keypair for the agent, fund via faucet, use as identity
- Either way, agent identity (address or DID) is included in all attestation events

**Patterns to follow:**
- Agent Passport MCP docs (if sufficient)
- Standard ethers.js wallet generation (fallback)

**Test scenarios:**
- Happy path: Agent registers identity, identity address appears in all on-chain attestations
- Happy path: Agent Passport MCP tools return valid payer address and can approve payments
- Fallback: If Agent Passport MCP is unavailable, agent uses standard wallet address seamlessly

**Verification:**
- Agent has a consistent on-chain identity
- Identity is traceable across all transactions on Kitescan

---

- [ ] **Unit 7: Frontend Dashboard**

**Goal:** Build a real-time dashboard that visualizes the agent economy in action.

**Requirements:** R5, R6, R10

**Dependencies:** Unit 3, Unit 4, Unit 5

**Files:**
- Create: `frontend/` (Next.js 14 app)
- Create: `frontend/app/page.tsx` (main dashboard)
- Create: `frontend/app/components/TaskBoard.tsx` (task posting + listing)
- Create: `frontend/app/components/AgentActivity.tsx` (real-time agent feed)
- Create: `frontend/app/components/EconomyMetrics.tsx` (volume, profit, costs)
- Create: `frontend/app/components/TransactionLog.tsx` (x402 payments with Kitescan links)
- Create: `frontend/app/components/TaskDetail.tsx` (task result view + approval)
- Test: Dashboard updates in real-time as agent processes tasks

**Approach:**
- Next.js 14 with App Router, Tailwind CSS for styling
- Supabase real-time subscriptions for live updates (no polling)
- Key UI sections:
  1. **Task Board:** Post new task (form), see open/in-progress/completed tasks
  2. **Agent Activity Stream:** Real-time feed of agent actions ("Accepted task X", "Bought stock data for $0.10", "Submitted report")
  3. **Economy Dashboard:** Total volume, agent earnings, agent expenses, net profit, number of transactions
  4. **Transaction Log:** Every x402 payment with amount, direction (in/out), Kitescan link
  5. **Task Result View:** See submitted result, approve/reject button
- Design: Clean, modern, professional -- UX quality is a MAJOR differentiator in Web3 hackathons
- Dark theme with accent colors for different transaction types (green = earned, red = spent)

**Patterns to follow:**
- Standard Next.js 14 App Router patterns
- Supabase real-time subscription API
- Tailwind CSS utility classes

**Test scenarios:**
- Happy path: Post a task via UI -> see it appear in task board -> agent accepts (agent activity updates) -> agent calls tools (activity + transaction log update) -> agent submits (result appears) -> approve result (payment flows, metrics update)
- Happy path: All Kitescan links in transaction log are valid and open to correct transactions
- Edge case: Dashboard loads with no tasks/transactions -> shows empty state, not broken layout
- Edge case: Multiple rapid transactions -> UI updates smoothly without flickering or race conditions

**Verification:**
- Dashboard reflects economy state in real-time
- All sections display correct data
- Kitescan links work
- UI is visually polished and professional

---

### Phase 3: Polish + Deploy + Submit (April 17-26)

- [ ] **Unit 8: Production Deployment**

**Goal:** Deploy entire stack to production, publicly accessible.

**Requirements:** R3, R6

**Dependencies:** Units 1-7

**Files:**
- Create: `vercel.json` (frontend deploy config)
- Create: `Dockerfile` or `railway.json` (backend deploy config)
- Modify: `.env.example` (document all required env vars)
- Create: `README.md` (comprehensive setup + usage guide)

**Approach:**
- Frontend: Deploy Next.js to Vercel (zero-config, automatic)
- Backend: Deploy Express to Railway (simple Node.js deploy, free tier)
- Database: Supabase cloud (already cloud-native)
- Smart contract: Already on Kite testnet
- Agent: Deploy as separate Railway service (always-on process)
- Configure CORS, environment variables, domain settings
- SSL/HTTPS on all endpoints (Vercel and Railway provide this)

**Test scenarios:**
- Happy path: Visit production URL, dashboard loads, post a task, agent processes it, full flow works
- Error path: Backend is temporarily unreachable -> frontend shows connection error, not blank page
- Edge case: Multiple users posting tasks simultaneously -> no data corruption

**Verification:**
- Production URL is publicly accessible
- Full economic loop works in production (not just localhost)
- No CORS or env var issues

---

- [ ] **Unit 9: Demo Video + Documentation**

**Goal:** Record a compelling 3-minute demo video and write comprehensive documentation.

**Requirements:** R3, R6, R9, R10

**Dependencies:** Unit 8

**Files:**
- Create: `README.md` (project overview, architecture, setup, demo link)
- Create: `docs/ARCHITECTURE.md` (technical architecture diagram)
- Create: demo video (3 minutes, hosted on YouTube)

**Approach:**

**Demo video script (3 minutes):**
- **[0:00-0:20] Hook:** "AI agents can spend money, but can they EARN money? We built an economy where they do both."
- **[0:20-0:40] Problem:** Show current state -- agents need human to sign up for every API, no way for agents to be paid for work
- **[0:40-1:00] Solution overview:** AgentEconomy architecture diagram, key innovation = closed economic loop
- **[1:00-2:30] Live demo:**
  - Post task: "Analyze Tesla stock performance and create a visual report" ($1 bounty)
  - Watch agent accept task in real-time
  - Watch agent buy stock data ($0.10) and chart generation ($0.05) -- x402 payments on Kite chain
  - Agent synthesizes report with charts
  - Approve result -- agent receives $1
  - Show profit: $1.00 - $0.15 = $0.85 net earnings
  - Click Kitescan links -- show real on-chain attestations
- **[2:30-3:00] Impact:** "This is the agentic economy. Agents that earn, spend, and profit -- all settled on Kite chain. Try it at [URL]."

**Documentation:**
- README with one-paragraph description, architecture diagram, demo link, setup instructions
- Keep it scannable -- judges spend 2 minutes reading docs max

**Test scenarios:**
- Happy path: Demo video runs smoothly through entire script without errors
- Happy path: README enables a new developer to understand the project in under 2 minutes

**Test expectation: none -- documentation/video artifact, verified by human review**

**Verification:**
- Demo video is under 3 minutes, professional quality
- README is clear and complete
- All links in documentation work

---

- [ ] **Unit 10: Final Testing + Submission**

**Goal:** End-to-end testing, bug fixes, and hackathon submission.

**Requirements:** All

**Dependencies:** Units 1-9

**Files:**
- Modify: Various bug fixes across all files
- Create: submission on hackathon portal

**Approach:**
- Run full demo flow 10+ times in production
- Test edge cases: empty task board, network failures, insufficient funds
- Fix any issues found
- Submit to hackathon portal before April 26 deadline
- Ensure all checklist items are met:
  - AI agent performs task and settles on Kite chain
  - Executes paid actions via x402
  - End-to-end live demo in production
  - Uses Kite chain for attestations
  - Functional UI
  - Demo publicly accessible
  - Demo video uploaded

**Test scenarios:**
- Integration: Full demo flow works 10 consecutive times without failure in production
- Edge case: Post task with very long description -> handled gracefully
- Edge case: Agent has zero USDT balance -> declines tasks instead of crashing
- Error path: Kite testnet is slow -> payments eventually settle, UI shows pending state

**Verification:**
- 10/10 successful demo runs
- All hackathon submission requirements met
- Submission completed on portal

## System-Wide Impact

- **Interaction graph:** Task board API <-> AI Agent <-> Tool APIs <-> Kite Chain attestation contract. Frontend observes all via Supabase subscriptions.
- **Error propagation:** Tool API failure should NOT kill the entire task. Agent should handle partial tool failures gracefully and report what it accomplished.
- **State lifecycle risks:** Task state machine must be strict -- no task should get stuck in "in_progress" forever. Add timeout (30 minutes) that returns task to "open" if agent doesn't submit.
- **API surface parity:** All APIs are REST/HTTP, consistent error format (JSON with `error` field).
- **Integration coverage:** The most critical integration to test is x402 payment -> Kite chain settlement -> attestation logging. This is the chain that proves the project works.
- **Unchanged invariants:** x402 protocol behavior is owned by Coinbase SDK -- we don't modify it, just use it.

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Kite testnet instability | Medium | High | Build mock chain layer for local dev. Only need testnet for final demo. Daily smoke test starting Week 1. |
| x402 facilitator issues (Coinbase CDP or Pieverse) | Low | Critical | Test both facilitators in Week 1. Use whichever is more stable. |
| Agent Passport docs insufficient | High | Medium | Fallback to standard wallet-based identity. Still shows agent identity on chain. |
| Claude API rate limits during demo | Low | High | Pre-cache agent reasoning for demo tasks. Have backup demo recording. |
| Scope creep | High | Medium | Strict MVP scope. Weekly check: "Is this needed for the 3-minute demo?" If no, cut it. |
| Demo failure during presentation | Low | Critical | Record backup demo video. Test 10+ times. Have fallback slides for each step. |
| Solo developer burnout over 3.5 weeks | Medium | High | Prioritize demo flow > code quality > edge cases. Working demo beats perfect code. |

### Priority Cut Order (if time runs short)

1. **Must have:** x402 payment flow + 1 tool API + task board + AI agent completing 1 task + minimal dashboard
2. **Should have:** 3-5 tool APIs + attestation contract + polished dashboard + Agent Passport
3. **Nice to have:** Advanced dashboard metrics + multiple task types + error recovery + cost optimization display
4. **Cut first:** Multiple agents, complex negotiation, governance controls, Python SDK

## Timeline Summary

| Week | Dates | Focus | Milestone |
|------|-------|-------|-----------|
| 1 | Apr 1-8 | x402 + Tools + Task Board + Agent | Milestone 1 (Apr 6): Submit project outline |
| 2 | Apr 9-16 | Chain integration + Frontend dashboard | Milestone 2 (Apr 12): Working demo |
| 3 | Apr 17-23 | Deploy + Polish + Demo video | Production deployment |
| 3.5 | Apr 24-26 | Final testing + Submission | Final submission (Apr 26) |

## Sources & References

- **x402 Protocol:** https://www.x402.org/ (75M+ monthly transactions, $24M volume)
- **x402 SDK:** https://github.com/coinbase/x402 (5,830 stars)
- **Kite Docs:** https://docs.gokite.ai/
- **Kite Testnet:** Chain ID 2368, RPC: https://rpc-testnet.gokite.ai/
- **Kite Explorer:** https://testnet.kitescan.ai/
- **Kite Sample dApp:** https://github.com/gokite-ai/kite_counter_dapp
- **Kite Faucet:** https://faucet.gokite.ai/
- **Hackathon Page:** https://www.encodeclub.com/programmes/kites-hackathon-ai-agentic-economy
- **Agent Pain Points:** LangChain State of Agent Engineering (57% agents in production, 52% lack evals)
- **x402 Adoption:** 140M+ total transactions, Coinbase + Cloudflare foundation
- **ChatGPT Checkout Failure:** Shut down March 2026 after near-zero conversion
- **Hackathon Winners Analysis:** Encode London 2025, ETHGlobal Agentic Ethereum 2025, Solana AI Hackathon, Microsoft AI Agents Hackathon 2025
