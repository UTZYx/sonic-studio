## 2026-01-15 - Accessibility Gaps in Custom Sliders
**Learning:** Custom slider components (div-based) often lack native accessibility features like `role="slider"`, `tabIndex`, and keyboard support, making them unusable for screen reader and keyboard-only users.
**Action:** Always wrap custom interactive elements with appropriate ARIA roles and implement `onKeyDown` handlers for standard interaction patterns (Arrow keys, Home/End).
