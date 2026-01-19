## 2024-03-21 - [FastAPI] Input Validation & CORS

**Vulnerability:** The Neural Bridge API exposed unbounded input fields (duration, size) and overly permissive CORS settings.
**Learning:** `FastAPI` + `Pydantic` allows easy but dangerous defaults. `allow_origins=["*"]` combined with `allow_credentials=True` is insecure and causes reflection of the `Origin` header.
**Prevention:**
1. Always use `pydantic.Field` with `le` (less than) and `max_length` constraints for user inputs.
2. Explicitly define allowed origins via environment variables (`CORS_ORIGINS`).
3. Sanitize exception details in production to prevent stack trace leaks.