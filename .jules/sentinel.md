## 2025-05-22 - [Denial of Service Prevention via Input Validation]
**Vulnerability:** The Neural Bridge backend (`server/neural_bridge.py`) accepted generation requests with arbitrary parameters, including unlimited prompt length, duration, and top_k values, posing a Denial of Service (DoS) risk and potential VRAM exhaustion.
**Learning:** Pydantic models alone (`BaseModel`) do not enforce value constraints unless explicitly defined using `Field`. Type hints like `int` or `float` are insufficient for security boundaries.
**Prevention:** Always use `pydantic.Field` to enforce strict minimum/maximum values (`ge`, `le`) and length constraints (`max_length`) for all external inputs, especially those controlling resource-intensive operations like AI generation.
