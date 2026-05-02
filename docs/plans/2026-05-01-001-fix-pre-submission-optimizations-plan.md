---
title: "fix: Pre-submission optimizations for AgentEconomy demo quality"
type: fix
status: active
date: 2026-05-01
---

# fix: Pre-submission optimizations for AgentEconomy demo quality

## Overview

Hackathon deadline is May 18, 2026 (17 days). The core system works end-to-end; this plan addresses bugs and gaps that judges will encounter during a 5-minute live demo or source code review. Items are grouped into three tiers by impact.

## Problem Frame

Research identified 15 specific issues across three categories: correctness bugs that show wrong data on screen, cosmetic gaps that make the project look unfinished, and production/code-quality issues visible during code review. Fixing Tier 1 items alone makes the demo substantially more credible.

## Requirements Trace

- R1. Dashboard shows correct numbers at all times (no embarrassing wrong counts)
- R2. Agent can operate without local dev setup (production-deployable)
- R3. Tool responses look plausible under casual inspection
- R4. Source code passes a 5-minute senior engineer scan without red flags
- R5. Frontend is keyboard-accessible for the core task detail flow

## Scope Boundaries

- No real external API integration for mock tools (TSLA price, news, web search) — mock quality improvement only
- No WebSocket/SSE refactor — polling stays
- No wallet connection — PostTaskForm creator address fix is cosmetic only
- No PostgreSQL migration — SQLite + Render persistent disk stays

### Deferred to Separate Tasks

- Multi-agent collaboration (separate agentswarm plan)
- Real x402 payments (blocked on Kite USDT EIP-3009 support)

## Context & Research

### Relevant Code and Patterns

- `src/server/routes/tasks.ts:317` — `openTasks` metric formula bug
- `src/shared/config.ts` — no `AGENT_SERVER_URL` env var, SERVER_URL hardcoded in `src/agent/index.ts:21`
- `src/server/db/index.ts` — three tables, zero non-PK indexes
- `src/server/routes/tools/translate.ts:39` — obviously fake fallback `[zh] original text`
- `frontend/app/components/MetricsRow.tsx:16-28` — `requestAnimationFrame` loop with no cleanup
- `frontend/app/components/TaskBoard.tsx:13-17` — submitted and completed share the same green badge color
- `frontend/app/components/PostTaskForm.tsx:35` — hardcoded `"0xDashboardUser"` creator address
- `frontend/app/components/TaskDetail.tsx` — no Escape key binding, no `aria-modal`
- `src/server/index.ts:30` — `/tools/discover` registered after `app.use('/tools', toolRoutes)`, duplicated handler
- `Dockerfile` — runs `tsx` at runtime, never compiles TypeScript

### Institutional Learnings

- x402 real payments intentionally use mock fallback — do not attempt to fix payment execution
- Render cold start is ~6s — health check before demo is part of demo checklist, not a code fix
- `usePolling` generic must be `usePolling<{tasks: Task[]}>` not `usePolling<Task[]>`
- SVGs need explicit `width`/`height` HTML attrs in Next.js SSR, not just Tailwind classes

## Key Technical Decisions

- **Tier 1 first, in order**: correctness bugs (wrong numbers, broken agent server URL) must ship before cosmetic fixes — no point polishing a dashboard with wrong metrics
- **Translate uses existing LLM client**: `OPENROUTER_API_KEY` / `ANTHROPIC_API_KEY` are already available in config; translate tool can call the LLM for a one-liner translation rather than maintaining a phrase table
- **DB indexes added inline in `db/index.ts`**: no migration framework exists; `CREATE INDEX IF NOT EXISTS` is idempotent and safe to add directly
- **Dockerfile compile step**: change builder stage only; final CMD switches from `tsx` to `node dist/`

## Implementation Units

- [ ] **Unit 1: Fix openTasks metric and verify metrics endpoint**

**Goal:** Dashboard OPEN count matches the actual open task rows, not `total - completed`.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `src/server/routes/tasks.ts`

**Approach:**
- Line ~317: replace `openTasks: totalTasks - completedTasks` with a direct `SELECT COUNT(*) FROM tasks WHERE status = 'open'` query using the existing `db` prepared-statement pattern in that file
- While in this file, verify the other metric calculations (`totalVolume`, `totalEarned`, `totalSpent`) are correct

**Test scenarios:**
- Happy path: seed tasks with statuses open/in_progress/submitted/completed, call `/api/metrics`, verify `openTasks` equals only the count with `status = 'open'`
- Edge case: empty database returns `openTasks: 0`, not `NaN` or negative

**Verification:** `curl localhost:4021/api/metrics` after seeding returns `openTasks` matching task board OPEN count

---

- [ ] **Unit 2: Add AGENT_SERVER_URL env var to config**

**Goal:** Agent can point at a remote server without a code change.

**Requirements:** R2

**Dependencies:** None

**Files:**
- Modify: `src/shared/config.ts`
- Modify: `src/agent/index.ts`
- Modify: `render.yaml`
- Modify: `.env.example` (if exists)

**Approach:**
- In `config.ts`: add `agentServerUrl: process.env.AGENT_SERVER_URL || \`http://localhost:\${port}\``
- In `agent/index.ts:21`: replace the hardcoded URL with `config.agentServerUrl`
- In `render.yaml`: add `AGENT_SERVER_URL` with value `https://agent-economy-api.onrender.com` so a future agent service deployment works out of the box

**Test scenarios:**
- Happy path: agent starts with no env var set, uses `http://localhost:4021`
- Happy path: `AGENT_SERVER_URL=https://agent-economy-api.onrender.com` set, agent uses that URL in all HTTP calls

**Verification:** `AGENT_SERVER_URL=http://localhost:4021 npm run dev:agent` runs without error; logs show correct server URL

---

- [ ] **Unit 3: Add DB indexes**

**Goal:** Eliminate full-table scans on every poll cycle; show code quality awareness to reviewers.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `src/server/db/index.ts`

**Approach:**
- Add after the `CREATE TABLE` statements:
  - `CREATE INDEX IF NOT EXISTS idx_tasks_status_created ON tasks(status, created_at DESC)`
  - `CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC)`
  - `CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC)`
  - `CREATE INDEX IF NOT EXISTS idx_activity_created ON agent_activity(created_at DESC)`
- These are idempotent; existing databases pick them up on next server start

**Test scenarios:**
- Test expectation: none — DDL-only change; verified by server starting without error and `EXPLAIN QUERY PLAN` on the frequent queries showing index usage

**Verification:** Server starts cleanly; no SQLite errors in logs

---

- [ ] **Unit 4: Fix translate tool — use LLM for real translations**

**Goal:** Translate tool returns a plausible translation instead of `[zh] original text`.

**Requirements:** R3

**Dependencies:** None (LLM client already available in server config)

**Files:**
- Modify: `src/server/routes/tools/translate.ts`

**Approach:**
- Remove the limited known-words table
- Call the existing LLM integration (same pattern as `planner.ts` / `synthesizer.ts`) with a short prompt: `"Translate the following to {targetLanguage}: {text}. Return only the translation."`
- If LLM is unavailable (no API key), fall back to a richer static phrase table (20+ realistic business/finance phrases) rather than the `[zh] original text` literal
- Keep the x402 payment gate and price ($0.05) unchanged

**Test scenarios:**
- Happy path: `OPENROUTER_API_KEY` set — POST to `/tools/translate` returns a real-looking translation, not a bracketed literal
- Error path: no API key set — returns a phrase from the expanded fallback table, not `[zh] {original}`
- Edge case: empty text input — returns empty string or appropriate error, not a crash

**Verification:** `curl -X POST localhost:4021/tools/translate -d '{"text":"hello world","from":"en","to":"zh"}'` returns a Chinese string (with payment header or mock bypass)

---

- [ ] **Unit 5: Fix submitted badge color + PostTaskForm creator address**

**Goal:** Submitted tasks are visually distinct from completed; creator address looks like a real wallet.

**Requirements:** R1, R3

**Dependencies:** None

**Files:**
- Modify: `frontend/app/components/TaskBoard.tsx`
- Modify: `frontend/app/components/PostTaskForm.tsx`

**Approach:**
- `TaskBoard.tsx:13-17`: change `submitted` status to map to `var(--warning)` (yellow/amber) instead of `var(--accent)` (green). DONE stays green; REVIEW becomes yellow.
- `PostTaskForm.tsx:35`: replace `"0xDashboardUser"` with a deterministic-but-plausible address. Best option: generate once in a `useMemo` or module-level constant using a short random hex string prefixed with `0x`, or read from `NEXT_PUBLIC_DEMO_CREATOR_ADDRESS` env var defaulting to `0xDemoUser000000000000000000000000000000`

**Test scenarios:**
- Happy path: submit a task from UI — task card shows yellow REVIEW badge, not green DONE badge
- Happy path: task detail for submitted task shows yellow badge
- Happy path: creator field in task detail is not the literal string `"0xDashboardUser"`

**Verification:** Visual inspection — submitted task is visually distinct from completed; creator shows a hex-formatted address

---

- [ ] **Unit 6: Fix AnimatedNumber RAF cleanup + add Escape key to TaskDetail**

**Goal:** No memory leak warnings in console; TaskDetail closes on Escape key.

**Requirements:** R4, R5

**Dependencies:** None

**Files:**
- Modify: `frontend/app/components/MetricsRow.tsx`
- Modify: `frontend/app/components/TaskDetail.tsx`

**Approach:**
- `MetricsRow.tsx`: in the `useEffect` that starts the `requestAnimationFrame` loop, store the frame ID in a `useRef` and return a cleanup function that calls `cancelAnimationFrame(frameRef.current)`. Add a `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check before starting the loop; if true, set `display` to `target` directly and skip animation.
- `TaskDetail.tsx`: add a `useEffect` that binds `keydown` → checks `e.key === 'Escape'` → calls `onClose()`. Cleanup removes the listener. Add `role="dialog"` and `aria-modal="true"` to the modal wrapper element.

**Test scenarios:**
- Happy path: open TaskDetail, press Escape — modal closes
- Happy path: MetricsRow unmounts mid-animation — no React `setState on unmounted component` warning in console
- Edge case: user has `prefers-reduced-motion` — numbers update immediately without animation

**Verification:** `npm run build` passes; no console warnings when rapidly opening/closing TaskDetail; Escape key closes modal

---

- [ ] **Unit 7: Fix Dockerfile — compile TypeScript in build stage**

**Goal:** Production container runs compiled JS, not tsx transpiler on every cold start.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `Dockerfile`

**Approach:**
- In the builder stage, after `npm ci`, add `RUN npm run build` (which runs `tsc --outDir dist`)
- Verify `tsconfig.json` has `outDir: "dist"` and `include: ["src/server/**/*", "src/shared/**/*"]` (agent is not served from Docker)
- In the final stage, change CMD from `npx tsx src/server/index.ts` to `node dist/server/index.js`
- Ensure `dist/` is copied in the final stage COPY step

**Test scenarios:**
- Test expectation: none — build pipeline change; verified by `docker build` completing without error and `docker run` starting the server correctly

**Verification:** `docker build -t agenteconomy .` succeeds; `docker run -e PORT=4021 agenteconomy` starts server and responds to `GET /health`

---

- [ ] **Unit 8: Move /tools/discover into toolRoutes**

**Goal:** Tool registry has a single source of truth; tool list and registered routes cannot drift.

**Requirements:** R4

**Dependencies:** None

**Files:**
- Modify: `src/server/routes/tools/index.ts`
- Modify: `src/server/index.ts`

**Approach:**
- Move the `/discover` handler from `src/server/index.ts` into `src/server/routes/tools/index.ts` as `router.get('/discover', ...)` at the top of that file, before any payment-gated routes
- The discover response reads from the same tool config object that the payment middleware uses — no data duplication
- Remove the duplicate handler from `src/server/index.ts`

**Test scenarios:**
- Happy path: `GET /tools/discover` returns the same tool list as before
- Regression: all other tool routes (`/tools/stock-data`, `/tools/web-search`, etc.) still respond correctly

**Verification:** `curl localhost:4021/tools/discover` returns tool list; existing tool routes unaffected

## System-Wide Impact

- **Interaction graph:** DB index changes affect all routes that query tasks, transactions, activity — all read-path only, no write behavior changes
- **Error propagation:** Translate LLM failure falls back gracefully; no new uncaught error surfaces
- **State lifecycle risks:** None — all changes are read-path or cosmetic
- **Unchanged invariants:** x402 payment middleware logic, agent task polling interval, SQLite WAL mode, LLM planner/synthesizer fallback chain

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| LLM translate call adds latency to `/tools/translate` | x402 route already has payment overhead; small additional LLM latency is acceptable. Add 10s timeout. |
| `tsc` compile fails due to type errors not caught by `npx tsc --noEmit` | Run `npx tsc --noEmit` first before changing Dockerfile; fix any errors found |
| Dockerfile CMD change breaks Render deploy (Render uses Dockerfile) | Test `docker build` locally before pushing; Render will redeploy automatically on push |
| Moving `/tools/discover` changes Express route resolution order | Verify with integration test that discover still returns correct list |

## Sources & References

- Research: repo-research-analyst findings (15 specific issues identified)
- Related plans: `docs/plans/2026-04-02-001-feat-agent-economy-phase2-plan.md`
- Key files: `src/server/routes/tasks.ts`, `src/shared/config.ts`, `frontend/app/components/MetricsRow.tsx`
