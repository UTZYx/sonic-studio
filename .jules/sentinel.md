## 2026-01-18 - Missing Pydantic Constraints in Backend

**Vulnerability:** The backend `GenerationRequest` model used Pydantic but lacked `Field` constraints, relying only on type hints. This allowed unrestricted input values (e.g., negative duration, huge prompts) leading to potential DoS or undefined behavior.

**Learning:** Pydantic models document intent but do not enforce validation logic unless `Field` constraints (e.g., `max_length`, `ge`, `le`) are explicitly defined. Code reviewers (and agents) should not assume type hints imply validation constraints.

**Prevention:** Always verify Pydantic models have explicit validation rules (`Field` or `@validator`) for external inputs. Use automated tests to verify boundary conditions are rejected (return 422).
