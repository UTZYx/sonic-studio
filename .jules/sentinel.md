## 2024-05-22 - Input Validation Gap in Neural Bridge
**Vulnerability:** The `GenerationRequest` Pydantic model lacked value constraints, allowing unbounded `duration` (DoS via GPU hogging) and massive `prompt` strings (memory exhaustion).
**Learning:** Pydantic's type hints (e.g., `int`, `str`) do not enforce value ranges or lengths at runtime; explicit validators or `Field` constraints are required.
**Prevention:** Always define public API models using `pydantic.Field(..., ge=min, le=max, max_length=N)` to enforce strict bounds at the schema level.
