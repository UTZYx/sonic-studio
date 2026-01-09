# Sentinel Journal

## 2025-05-18 - [Unbounded Input leading to DoS]
**Vulnerability:** The `GenerationRequest` Pydantic model in `server/neural_bridge.py` allowed unbounded values for `duration`, `top_k`, and `temperature`. A malicious actor could request an extremely long duration, causing the GPU to lock up and denying service to other users (DoS).
**Learning:** Even internal API endpoints need rigorous input validation, especially when triggering expensive hardware operations like GPU generation. Pydantic's `Field` should always be used for numerical inputs.
**Prevention:** Use `pydantic.Field` with `ge` (greater than or equal) and `le` (less than or equal) constraints for all numerical inputs in API models.
