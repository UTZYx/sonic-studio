## 2026-02-02 - Unbounded Input in Neural Bridge
**Vulnerability:** The `GenerationRequest` model lacked constraints on `duration`, `prompt` length, and model parameters, exposing the backend to Denial of Service (DoS) via GPU resource exhaustion.
**Learning:** Pydantic models used for API payloads must explicitly define `Field` constraints (e.g., `max_length`, `ge`, `le`) to enforce safety limits at the validation layer, especially for resource-intensive operations like generative AI.
**Prevention:** Always use `pydantic.Field` with strict bounds for all public API inputs, and unit test boundary conditions.
