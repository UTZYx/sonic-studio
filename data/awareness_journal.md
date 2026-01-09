
## Professional Improvements: Split Intelligence & Scalability

**Date:** 2024-05-22
**Focus:** Architecture Over Models

### 1. Neural Bridge as a Generator Node
We have successfully refactored `neural_bridge.py` to decouple generation from delivery. By returning a `manifest.json` and serving files via static mounts, we have transformed the bridge from a "Stream Pipe" into a "Content Node".

**Why this is professional:**
- **Resilience:** If the connection drops after generation but before download, the data is not lost. It is persisted on disk.
- **Scalability:** The "Manifest" pattern allows the bridge to be deployed on remote GPUs (e.g., RunPod). The client simply needs the `NEURAL_BRIDGE_URL`.
- **Composability:** By saving `stem_{i}.wav`, we enable future features like "Remixing" or "Spatial Audio" on the client side without re-generation.

### 2. Next Steps for Enterprise Grade
To fully realize the "Split Intelligence" vision, we should implement:

1.  **Async Polling Pattern:**
    - Currently, `processJob` in Next.js still awaits the `POST /generate` request (which blocks until completion).
    - **Improvement:** `POST /generate` should return `202 Accepted` + `job_id` immediately. The Python server should spawn a background thread.
    - The Client then polls `GET /jobs/{id}` (or similar) on the Bridge until `status: completed`.
    - This prevents HTTP timeouts on long generations (30s+).

2.  **Storage Adapter:**
    - Instead of local disk (`server/outputs`), use S3/R2 presigned URLs. This makes the Bridge purely compute (stateless) and allows the Frontend to fetch from a CDN.

3.  **Queue Management:**
    - The `ModelManager` is single-threaded. A proper Redis queue (Celery/BullMQ) would allow handling concurrent requests by queuing them, rather than 503-ing or blocking.

### 3. Immediate Action
- The current implementation is a valid "v1.5" step: it establishes the *Contract* (Manifests) while keeping the *Transport* simple (HTTP Block).
- Verified that `HuggingFaceClient` now respects `NEXT_PUBLIC_NEURAL_BRIDGE_URL`, enabling remote GPU integration immediately.
