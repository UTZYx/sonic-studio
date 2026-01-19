## 2026-01-19 - Unbounded Generation Parameters (DoS Risk)
**Vulnerability:** The `GenerationRequest` Pydantic model in `server/neural_bridge.py` accepted unbounded `duration` and `layers`, allowing attackers to exhaust GPU/server resources.
**Learning:** Default Pydantic models do not enforce numerical ranges or string lengths unless `Field` constraints are explicitly added.
**Prevention:** Always use `Field(..., ge=min, le=max)` for numerical inputs and `max_length` for strings/lists in public-facing API models.
