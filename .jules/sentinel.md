# Sentinel Journal

## 2026-01-18 - Missing Backend Input Validation
**Vulnerability:** The FastAPI backend (`server/neural_bridge.py`) accepted unbounded inputs for audio generation parameters (duration, top_k, prompt length), allowing potential Denial of Service (DoS) attacks.
**Learning:** Pydantic models default to unconstrained types unless `Field` validators are explicitly used. Documentation claiming constraints exist is not a substitute for code-level enforcement.
**Prevention:** Always use Pydantic `Field(..., le=X, ge=Y, max_length=Z)` for any public-facing API inputs to enforce hard limits at the schema level.
