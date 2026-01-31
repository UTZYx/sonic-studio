# Bolt's Journal ⚡

## 2026-01-24 - Async Def Blocking Event Loop
**Learning:** Defining a FastAPI endpoint as `async def` while performing blocking CPU/GPU operations (like PyTorch inference) freezes the event loop, causing DoS for other endpoints (like health checks).
**Action:** Remove `async` from heavy endpoints to leverage FastAPI's thread pool, or use `await asyncio.to_thread()`.
