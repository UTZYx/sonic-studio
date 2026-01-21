## 2026-01-18 - [Secure Backend Configuration]
**Vulnerability:** The backend `neural_bridge.py` exposed an unrestricted CORS configuration (`allow_origins=["*"]`) with credentials enabled, allowing arbitrary sites to make authenticated requests. It also lacked input validation for generation parameters (DoS risk) and leaked stack traces in 500 error responses.
**Learning:** Default copy-paste configurations (like `allow_origins=["*"]`) often persist into production-like environments. Python web frameworks (FastAPI) require explicit Pydantic `Field` constraints to prevent resource exhaustion attacks via oversized inputs.
**Prevention:**
1. Use `os.getenv("CORS_ORIGINS")` to strictly define allowed origins.
2. Enforce strict bounds on all Pydantic model fields (length, range) using `Field(...)`.
3. Catch all exceptions in endpoint handlers and return generic 500 messages, logging the details internally.
