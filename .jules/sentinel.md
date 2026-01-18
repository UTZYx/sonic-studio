## 2026-01-10 - Input Validation in Split Intelligence
**Vulnerability:** Unbounded input parameters (duration) in GenerationRequest.
**Learning:** In the "Split Intelligence" architecture (System 1 vs System 2), System 2 (Neural Bridge) is a heavy resource consumer. Unbounded inputs directly translate to massive GPU resource lockups (DoS), unlike typical web apps where they might just cause a slow query.
**Prevention:** Enforce strict Pydantic `Field` constraints (`le=120`, `ge=1`) on all generation parameters to protect the "Reasoning Layer".
