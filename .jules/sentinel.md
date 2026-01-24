## 2026-01-18 - Neural Bridge Input Validation Gap
**Vulnerability:** The `server/neural_bridge.py` exposed a `generate` endpoint accepting unbounded `duration` and `prompt` lengths, creating a Denial of Service (DoS) vector against the GPU.
**Learning:** Python backends wrapping AI models often focus on functionality over defense. Testing these requires mocking heavy dependencies (Torch, Audiocraft) to avoid massive environment setups.
**Prevention:** Enforce Pydantic `Field` constraints (max_length, le, ge) on all user-controlled inputs in FastAPI models, and use lightweight mock-based tests for validation logic.
