## 2026-02-02 - Custom Input Accessibility Gap
**Learning:** Custom interactive components like `Knob` were implemented purely visually (divs with mouse events), completely excluding keyboard and screen reader users. This suggests a pattern where "interactive" is defined only by mouse behavior.
**Action:** Enforce a standard where any custom input component must implement `role`, `tabIndex`, and `onKeyDown` handlers before visual polish.
