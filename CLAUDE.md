# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (3 terminals)
npm run dev:server                          # Backend on :4021
cd frontend && npm run dev                  # Frontend on :3021
npm run dev:agent                           # AI agent (polls tasks)

# Build / Lint
npx tsc --noEmit                            # TypeScript check (backend)
cd frontend && npx next build               # Frontend build check
cd frontend && npm run lint                  # Next.js ESLint

# Seed demo data (server must be running)
npx tsx src/scripts/seed-demo.ts            # Populate tasks, transactions, activity

# Smart contract
npx hardhat compile                         # Compile Solidity
npx hardhat run scripts/deploy.ts --network kiteTestnet  # Deploy to Kite testnet

# Debug scripts
npx tsx src/scripts/check-token.ts          # Check USDT decimals + wallet balances
npx tsx src/scripts/test-x402-debug.ts      # Debug x402 payment flow (server must be running)
```

## Architecture

Three independent processes that communicate via HTTP:

**Backend (Express, port 4021)** -- REST API with x402 payment middleware on tool routes. SQLite database (WAL mode) stores tasks, transactions, and agent activity. Attestation service writes events to Kite chain contract via ethers.js.

**Agent (Node.js subprocess)** -- Polls `/tasks?status=open` every 5s. Uses LLM (OpenRouter > Anthropic > keyword fallback) to plan which tools to call. Calls paid tool APIs with x402 fetch wrapper; falls back to mock data if payment fails. Synthesizes results via LLM or templates. Submits to `/tasks/:id/submit`.

**Frontend (Next.js 14, port 3021)** -- Polls backend every 3s. Dark terminal-finance theme with JetBrains Mono (data) + DM Sans (UI). Components: MetricsRow, TaskBoard, ActivityFeed, TransactionLog, PostTaskForm, TaskDetail.

## x402 Payment Flow

Tool routes (`src/server/routes/tools/`) are wrapped by `createPaymentMiddleware` (`src/server/middleware/x402.ts`). The middleware intercepts requests, returns HTTP 402 with pricing if no payment header, then verifies payment via the Pieverse facilitator before forwarding to the handler. The agent (`src/agent/tool-caller.ts`) uses `@x402/fetch` to automatically handle 402 responses -- it reads the price, signs a payment with the agent wallet, and retries with the payment header. If payment fails (e.g., insufficient balance), the agent falls back to mock data and logs the failure. Successful payments are recorded as transactions in SQLite and optionally attested on-chain via `src/server/services/attestation.ts`.

## Key Gotchas

- **ESM/CJS split**: Root is ESM (`"type": "module"`). Hardhat config MUST be `.cjs` -- Hardhat 2 doesn't support ESM configs.
- **Kite USDT lacks EIP-3009/EIP-2612**: x402 exact scheme cannot execute real payments on this token. Agent uses mock fallback; on-chain attestations (direct ethers.js calls) still work.
- **SVG in Next.js SSR**: Must include `width`/`height` HTML attributes, not just Tailwind classes.
- **usePolling type shape**: API returns `{tasks: [...]}` not `Task[]`. Generic must be `usePolling<{tasks: Task[]}>` then destructure.
- **CWD drift**: `cd frontend` changes working directory for all subsequent commands. Use absolute paths or explicit `cd` back.
- **Process cleanup**: `pkill -f "tsx"` kills ALL tsx processes. Track PIDs individually with `$!` and `kill $PID`.

## Environment Variables

Required in `.env`:
- `AGENT_PRIVATE_KEY` -- Signs x402 payments and attestation TXs
- `PAYEE_ADDRESS` -- Receives tool API payments
- `ATTESTATION_CONTRACT_ADDRESS` -- On-chain attestation contract (empty = local-only logging)
- `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` -- LLM for agent planning/synthesis (empty = keyword/template fallback)
- `FACILITATOR_URL` -- x402 facilitator (default: `https://facilitator.pieverse.io`)

Frontend: `NEXT_PUBLIC_API_URL` -- Backend URL (default: `http://localhost:4021`)

## Deployment

- Frontend: Vercel (https://kite-agent-economy.vercel.app)
- Backend: Render with persistent disk at `/data` (https://agent-economy-api.onrender.com)
- Contract: `0x439Ea30758B27dc07B76EFB4dA9311A011B7554E` on Kite testnet (Chain ID 2368)

## Mistakes Log

| Mistake | Fix |
|---------|-----|
| CWD 因 `cd frontend` 漂移，后续命令找不到文件 | 用绝对路径或显式 `cd` 回项目根目录 |
| `pkill -f "tsx"` 误杀所有 tsx 进程（server + agent） | 用 PID 变量跟踪，`kill $PID` 精确终止 |
| Kite Test USDT 不支持 EIP-3009/EIP-2612 | x402 exact scheme 无法真实支付，用 mock fallback + 链上 attestation 替代 |
| SVG 在 Next.js SSR 中只靠 Tailwind class 不显示尺寸 | SVG 必须加 `width`/`height` HTML 属性 |
| usePolling 泛型与 API 返回形状不匹配 | API 返回 `{tasks: [...]}` 要用 `usePolling<{tasks: Task[]}>` 再解构 |
| Faucet 有 reCAPTCHA | Playwright 无法自动完成验证码，需提示用户手动操作 |
| 用 ffmpeg 录屏时 VS Code 抢占焦点，录到错误窗口 | 用 Claude in Chrome 扩展的 `gif_creator` 工具直接录制浏览器内容（不依赖窗口焦点），再用 ffmpeg 转 MP4 |
| Render 免费实例休眠后前端显示 OFFLINE | 先 `curl https://agent-economy-api.onrender.com/health` 唤醒（约 6 秒冷启动），再操作 |
| seed-demo.ts 默认只打本地 | 生产环境注入数据：`npx tsx src/scripts/seed-demo.ts https://agent-economy-api.onrender.com` |
