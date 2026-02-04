## 2026-02-04 - [DoS Vulnerability in Neural Bridge]
**Vulnerability:** The `generate` endpoint lacked input validation for `duration` and `prompt`, allowing for potential Denial of Service (DoS) by exhausting GPU resources or memory with excessively large requests.
**Learning:** Pydantic models define structure but do not enforce value constraints (like `max_length` or range limits) by default unless `Field` is explicitly used. Relying on type hints (`int`, `str`) is insufficient for security.
**Prevention:** Always use `pydantic.Field` to enforce bounds (min/max length, ge/le) on all external inputs in Pydantic models.
