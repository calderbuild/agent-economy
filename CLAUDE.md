# AgentEconomy Project Rules

## Project Context

Kite AI Global Buildathon 2026 hackathon project. Agentic Commerce track.
Final submission deadline: April 26, 2026.

## Tech Stack

- Backend: Express + TypeScript + x402 SDK + ethers.js
- Frontend: Next.js 14 + Tailwind CSS
- Agent: Claude API via OpenRouter (fallback: keyword matching)
- Chain: Kite Testnet (Chain ID 2368, EVM-compatible Avalanche subnet)
- DB: SQLite (better-sqlite3)
- Contract: Solidity 0.8.24 + Hardhat

## Commands

```bash
npm run dev:server    # Start backend (port 4021)
npm run dev:agent     # Start AI agent
cd frontend && npm run dev -- -p 3021  # Start frontend
npx hardhat run scripts/deploy.ts --network kiteTestnet  # Deploy contract
```

## Deployment

- Frontend: Vercel (https://frontend-gilt-nu-30.vercel.app)
- Backend: Render (https://agent-economy-api.onrender.com)
- Contract: 0x439Ea30758B27dc07B76EFB4dA9311A011B7554E

## Mistakes Log

| Mistake | Fix |
|---------|-----|
| CWD 因 `cd frontend` 漂移，后续命令找不到文件 | 用绝对路径或显式 `cd` 回项目根目录 |
| `pkill -f "tsx"` 误杀所有 tsx 进程（server + agent） | 用 PID 变量跟踪，`kill $PID` 精确终止 |
| Kite Test USDT 不支持 EIP-3009/EIP-2612 | x402 exact scheme 无法真实支付，用 mock fallback + 链上 attestation 替代 |
| SVG 在 Next.js SSR 中只靠 Tailwind class 不显示尺寸 | SVG 必须加 `width`/`height` HTML 属性 |
| 用户要求用 skill 时手动模拟而非调用 Skill tool | 必须通过 Skill tool 激活，不能跳过 |
| Faucet 有 reCAPTCHA | Playwright 无法自动完成验证码，需提示用户手动操作 |
| usePolling 泛型与 API 返回形状不匹配 | API 返回 `{tasks: [...]}` 要用 `usePolling<{tasks: Task[]}>` 再解构 |
