---
title: Kite AI Global Buildathon 2026 - Competition Plan
type: feat
date: 2026-03-05
track: Agentic Commerce
status: draft
---

# Kite AI Global Buildathon 2026 - Competition Plan

## 1. Hackathon Overview

| Item | Detail |
|------|--------|
| Name | Kite AI Global Buildathon 2026 - Powering the Agentic Economy |
| Organizer | Encode Club + Kite AI |
| Format | Online, 4 weeks |
| Start | March 27, 2026 |
| Milestone 1 | April 6 - Project outline |
| Milestone 2 | April 12 - Mid-hackathon checkpoint |
| Final Submit | April 26 |
| Finale | May 6 |
| Judges | Microsoft, Uber, Nvidia, Meta, Google DeepMind, Academia |

## 2. Track Selection: Agentic Commerce

### Why Not Other Tracks

- **Agentic Trading**: Crowded track. Every crypto hackathon team defaults to trading bots. Hard to differentiate. Judges have seen hundreds of "AI trading agents."
- **Novel Track**: High variance. No clear evaluation criteria anchor. Risky for a team aiming to win.

### Why Agentic Commerce

1. **Directly showcases Kite's flagship tech** -- x402 payment protocol + Agent Passport. Projects that make the sponsor look good win.
2. **Clear real-world PMF** -- McKinsey identifies agentic commerce as a breakout trend. OpenAI launched Operator and Agentic Commerce Protocol with Stripe. This is where the industry is heading.
3. **Under-served by existing solutions** -- No production-grade infrastructure exists for AI agents to autonomously discover and pay for API services.
4. **Fewer competitors** -- Most hackathon teams avoid commerce because it's "boring" compared to trading. Less competition = higher win probability.

## 3. Project: AgentPay Gateway

### One-Sentence Pitch

An autonomous API payment gateway where AI agents discover, negotiate, and pay for web services using x402/USDC micropayments on Kite chain -- no signup, no API keys, just pay-per-request.

### Problem

Today, when an AI agent needs to use a paid API (weather data, market data, translation, image generation, etc.), a human must:

1. Find the API provider
2. Sign up for an account
3. Set up billing (credit card)
4. Generate API keys
5. Configure rate limits and quotas
6. Monitor usage and costs

This breaks agent autonomy completely. The agent cannot independently discover and use new services.

### Solution

AgentPay Gateway is a middleware layer that:

1. **Service Registry** -- API providers register their services with pricing (per-request in USDC), capability descriptions, and x402 payment endpoints
2. **Agent Discovery** -- AI agents query the registry by natural language capability ("I need real-time weather data for Shanghai") and get ranked service options
3. **Autonomous Payment** -- Agent selects a service, sends request with x402 payment header, USDC settles on Kite chain
4. **Identity & Trust** -- Agent uses Kite Agent Passport for verifiable identity; service providers can set trust requirements
5. **Attestation Trail** -- Every transaction creates on-chain attestation for auditability

### Architecture

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|   AI Agent       |---->|  AgentPay Gateway |---->|  API Providers   |
|   (with Kite     |     |                   |     |  (x402-enabled)  |
|    Passport)     |<----|  - Service Registry|<----|                  |
|                  |     |  - x402 Proxy     |     +------------------+
+------------------+     |  - Attestation    |
                         |  - Agent SDK      |
                         +-------------------+
                                  |
                         +-------------------+
                         |   Kite Chain      |
                         |   - USDC Settle   |
                         |   - Attestations  |
                         |   - Agent Passport|
                         +-------------------+
```

### User Flow

1. **Service Provider** registers API on AgentPay (endpoint, pricing, capabilities)
2. **Agent Owner** creates agent with Kite Passport, sets spending constraints (e.g., max $5/day)
3. **Agent** receives task from user: "Research the weather in 10 cities and summarize"
4. **Agent** queries AgentPay registry: "weather API, real-time, JSON, < $0.01/request"
5. **AgentPay** returns ranked options with pricing
6. **Agent** sends HTTP request to chosen API with x402 payment header
7. **API** returns 200 + data; USDC settles on Kite chain
8. **Attestation** recorded on-chain: agent X paid Y USDC to service Z for capability W
9. **Agent** aggregates results and returns to user

### Why This Wins (Judging Criteria Alignment)

| Criteria | How We Score |
|----------|-------------|
| **Agent Autonomy** | Agent discovers, selects, pays, and uses services with zero human intervention. The entire loop is autonomous. |
| **Developer Experience** | Clean SDK (`agentpay.discover("weather")` -> `agentpay.pay(service, request)`), Web UI dashboard, clear docs with examples |
| **Real-World Applicability** | Solves the #1 barrier to agent autonomy: payment friction. Every AI agent builder needs this. Direct PMF. |
| **Novel/Creativity** | First agent-native API marketplace with x402 micropayments. Combines Kite Passport identity + x402 payments + on-chain attestations in a novel way. |

## 4. Technical Stack

| Layer | Tech |
|-------|------|
| Frontend (Dashboard) | Next.js + Tailwind CSS |
| Backend API | Node.js / Express or Python FastAPI |
| Agent SDK | TypeScript + Python packages |
| Smart Contracts | Solidity on Kite Chain |
| x402 Integration | Coinbase x402 SDK / Kite x402 primitives |
| Identity | Kite Agent Passport SDK |
| Attestation | Kite chain on-chain attestations |
| Database | PostgreSQL (service registry) |
| Deployment | Vercel (frontend) + AWS Lambda (backend) |
| AI Agent Demo | Claude API / OpenAI API for demo agent |

## 5. MVP Scope (4 Weeks)

### Week 1 (March 27 - April 2): Foundation

- [ ] Set up Kite testnet environment
- [ ] Implement Agent Passport integration (agent creation + identity)
- [ ] Build service registry (CRUD for API providers)
- [ ] Create basic x402 payment flow (agent -> gateway -> provider)
- [ ] **Deliverable**: Working x402 payment between agent and single API

### Week 2 (April 3 - April 9): Core Features

- [ ] Build service discovery engine (natural language -> ranked services)
- [ ] Implement spending constraints (daily/monthly limits in smart contract)
- [ ] Add on-chain attestation recording
- [ ] Build Agent SDK (TypeScript first, then Python wrapper)
- [ ] **Deliverable**: Agent can discover and pay for services autonomously

### Week 3 (April 10 - April 16): Polish & Demo

- [ ] Build Web UI dashboard (agent activity, spending, attestation history)
- [ ] Register 3-5 demo API services (weather, news, translation, image, market data)
- [ ] Build impressive demo agent that chains multiple services
- [ ] Write comprehensive README with video walkthrough
- [ ] **Deliverable**: End-to-end working demo with UI

### Week 4 (April 17 - April 26): Production & Submission

- [ ] Deploy to production (Vercel + AWS)
- [ ] Performance optimization and edge cases
- [ ] Record demo video (3-5 min)
- [ ] Final documentation and code cleanup
- [ ] Submit project
- [ ] **Deliverable**: Production-ready, publicly accessible demo

### Milestone Deadlines

- **April 6**: Submit project outline (team + idea description)
- **April 12**: Mid-hackathon checkpoint (working x402 payment + discovery)
- **April 26**: Final submission

## 6. Demo Script (for Finale)

1. **Opening** (30s): "AI agents are everywhere, but they can't pay for anything. We fixed that."
2. **Problem** (30s): Show an agent trying to use a paid API -- stuck at signup/billing
3. **Solution** (30s): Show AgentPay architecture diagram
4. **Live Demo** (2min):
   - Create agent with Kite Passport
   - Give agent a task: "Compare weather in 5 cities using the cheapest available weather API"
   - Watch agent autonomously discover services, compare prices, pay via x402, aggregate results
   - Show on-chain attestation trail in dashboard
5. **Impact** (30s): Market size, PMF signals, what this enables

## 7. Submission Requirements Checklist

- [ ] AI agent performs task and settles on Kite chain
- [ ] Executes paid actions (API calls via x402)
- [ ] End-to-end live demo in production (Vercel/AWS)
- [ ] Uses Kite chain for attestations (proof, auditability)
- [ ] Functional UI (Web dashboard)
- [ ] Demo publicly accessible or reproducible via README

## 8. Competitive Analysis (vs Potential Other Projects)

| Likely Competitor Projects | Our Advantage |
|---------------------------|---------------|
| Simple chatbot that pays for one API | We have discovery + marketplace + multi-service |
| Trading bot on Kite | We're in Commerce track, less competition |
| NFT minting agent | No real PMF, novelty only |
| DeFi yield optimizer | Doesn't showcase x402 payment protocol |

## 9. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Kite testnet instability | Build mock layer for local development; integrate Kite last |
| x402 SDK immature | Use Coinbase CDP x402 SDK as reference; implement custom if needed |
| Scope creep | Strict MVP: 1 agent, 3 APIs, 1 dashboard. No extras. |
| Team bandwidth | Prioritize demo flow > code quality. Working demo beats perfect code. |
| Documentation gaps | Join Kite Discord early, ask questions day 1 |

## 10. Key Resources

- Kite Docs: https://docs.gokite.ai/
- Kite GitHub: https://github.com/gokite-ai/developer-docs
- Kite Whitepaper: https://gokite.ai/kite-whitepaper
- x402 Protocol: https://www.x402.org/
- x402 Coinbase Docs: https://docs.cdp.coinbase.com/x402/welcome
- Encode Club Discord: https://discord.gg/BsPbaShcxv

## 11. Research Sources

- [Encode London 2025 Winners](https://medium.com/@envio_indexer/encode-london-2025-celebrating-envios-hackathon-winners-22f59515f2db)
- [Etherlink Hackathon 2025 Results](https://techeconomy.ng/etherlink-hackathon-2025-concludes-100-projects-40k-prizes/)
- [Microsoft AI Agents Hackathon 2025 Winners](https://techcommunity.microsoft.com/blog/azuredevcommunityblog/ai-agents-hackathon-2025-%E2%80%93-category-winners-showcase/4415088)
- [x402 Protocol Introduction (Coinbase)](https://www.coinbase.com/developer-platform/discover/launches/x402)
- [Kite AI Blockchain x402 Analysis](https://www.gate.com/learn/articles/kite-ai-project-explained-the-rise-of-the-ai-payment-chain-with-x402-primitive-support/13371)
- [McKinsey: Agentic Commerce Opportunity](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-agentic-commerce-opportunity-how-ai-agents-are-ushering-in-a-new-era-for-consumers-and-merchants)
- [LangChain: State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering)
