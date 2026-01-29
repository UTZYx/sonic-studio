## 2024-05-23 - Missing Input Validation in Neural Bridge
**Vulnerability:** The Neural Bridge (`server/neural_bridge.py`) exposed generation endpoints without input validation (allowing potential DoS via large payloads) and leaked internal stack traces on errors.
**Learning:** Security standards defined in project memory/documentation are not guarantees of implementation; validation code was completely missing despite "strict constraints" being a known standard.
**Prevention:** Enforce Pydantic `Field` constraints on all inbound data models and implement a global exception handler that masks internal errors.
