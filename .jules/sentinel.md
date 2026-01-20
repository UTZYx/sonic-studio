## 2026-01-20 - Backend Hardening (CORS & Validation)
**Vulnerability:** The FastAPI backend had permissive CORS (`*`), lacked input validation (DoS risk), and leaked stack traces.
**Learning:** Backend code often defaults to insecure quick-start configurations (like `allow_origins=["*"]`) which are dangerous in production.
**Prevention:** Always use Pydantic `Field` constraints for public inputs and explicit CORS origins. Use generic error messages for 500s.
