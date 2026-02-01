## 2026-01-18 - [Custom Sliders Accessibility Gap]
**Learning:** Custom interactive components (like `Knob`) built with mouse-only listeners on `div`s completely exclude keyboard and screen reader users.
**Action:** When creating custom inputs, always implement `role`, `tabIndex`, and `onKeyDown` handlers for standard interaction keys (Arrows, Home, End).
