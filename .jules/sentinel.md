## 2026-02-03 - [Backend Input Validation Regression]
**Vulnerability:** The `GenerationRequest` Pydantic model lacked field constraints (length, range), contradicting established memory/documentation.
**Learning:** Documentation or "Memory" can drift from code reality. Always verify constraints exist in the actual code (e.g. `Field(...)`), don't assume they are inherited or magically enforced.
**Prevention:** Explicitly use `pydantic.Field` for all untrusted inputs. Add tests that specifically target boundary conditions (e.g. huge strings, negative numbers) to catch regressions.
