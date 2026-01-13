## 2026-01-13 - Overly Permissive CORS Configuration
**Vulnerability:** The backend `neural_bridge.py` was configured with `allow_origins=["*"]` and `allow_credentials=True`.
**Learning:** In FastAPI/Starlette, combining `allow_origins=["*"]` with `allow_credentials=True` forces the middleware to reflect the `Origin` header of the request, effectively allowing ANY origin to make credentialed requests (CSRF risk), rather than behaving as a wildcard.
**Prevention:** Always explicitly define allowed origins (e.g., via environment variables) when `allow_credentials=True` is required. Use `["*"]` only for public, non-credentialed APIs.
