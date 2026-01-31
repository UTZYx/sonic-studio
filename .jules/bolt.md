## 2026-01-31 - FastAPI Async Blocking
**Learning:** Defining FastAPI endpoints with `async def` runs them on the main event loop. If the handler performs blocking CPU/GPU work (like PyTorch inference), it freezes the entire server, preventing concurrent requests (like health checks) from completing.
**Action:** Use `def` (synchronous) for endpoints that perform blocking operations. FastAPI will automatically run them in a thread pool, keeping the event loop responsive.
