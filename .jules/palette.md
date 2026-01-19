## 2026-01-17 - Accessibility in Custom Interactive Components
**Learning:** Custom interactive components (like `Knob` or `Fader`) implemented with `div` elements often lack native accessibility features, making them unusable for keyboard and screen reader users.
**Action:** When creating custom sliders, always include `role="slider"`, `tabIndex={0}`, ARIA range attributes (`aria-valuenow`, etc.), and `onKeyDown` handlers for standard keyboard navigation (Arrows, Home, End).
