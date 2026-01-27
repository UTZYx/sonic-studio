## 2026-01-22 - [Neural Bridge Hardening]
**Vulnerability:** Missing Pydantic validation and unhandled exceptions in Neural Bridge allowed potential DoS via resource exhaustion and stack trace leakage.
**Learning:** Pydantic models require explicit `Field` constraints (e.g., `max_length`, `le`) to enforce boundaries; type hints alone do not validate values.
**Prevention:** Enforce strict schema validation on all API inputs and wrap endpoints in generic exception handlers to mask internal errors.
