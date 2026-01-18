## 2024-05-24 - [Pydantic DoS Protection]
**Vulnerability:** FastAPI Pydantic models accepted unbounded inputs (e.g., negative duration, huge top_k), enabling Denial of Service (DoS) and logic errors.
**Learning:** Type hints in Python (e.g., `duration: int`) are insufficient for validation; they only handle casting, not logic constraints.
**Prevention:** Always use `pydantic.Field(..., le=max_val, ge=min_val)` for numeric inputs exposed to public APIs.
