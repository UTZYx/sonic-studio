## 2026-01-16 - Unbounded Inputs and Wildcard CORS
**Vulnerability:** `server/neural_bridge.py` exposed two risks: 1) `duration` and `top_k` inputs were unbounded, allowing attackers to trigger long-running GPU processes (DoS). 2) CORS was configured with `allow_origins=["*"]` and `allow_credentials=True`, violating security standards.
**Learning:** Developers often overlook numerical limits in Pydantic models, assuming reasonable usage. Similarly, wildcard CORS is convenient for dev but dangerous if deployed with credentials enabled.
**Prevention:** Mandate `pydantic.Field` constraints (e.g., `le=120`) for all resource-intensive parameters. Use `os.getenv("CORS_ORIGINS").split(",")` to enforce explicit allowed origins.
