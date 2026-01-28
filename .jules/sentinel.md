## 2026-01-18 - [Backend Security Hardening]
**Vulnerability:** API lacked input validation (DoS risk), used wildcard CORS, and leaked stack traces.
**Learning:** Pydantic models must use `Field` constraints (max_length, ge/le) to enforce security boundaries, not just types.
**Prevention:** Always define `max_length` for strings and range limits for numbers in public-facing Pydantic models. Use `CORSMiddleware` with explicit origins.
