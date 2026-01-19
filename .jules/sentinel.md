## 2024-05-23 - Pydantic Constraints Missing Despite Memory Standard
**Vulnerability:** DoS risk via unbounded duration/top_k in neural_bridge.py.
**Learning:** Memory standards are not self-enforcing; existing code may violate them.
**Prevention:** Always audit existing code against memory security standards.
