## 2026-01-27 - Custom Knob Accessibility
**Learning:** Custom interactive components like `Knob` (dials) are often built with `div`s for mouse interactions but completely exclude keyboard users, creating a critical accessibility gap for blind or motor-impaired users.
**Action:** When creating custom sliders/dials, always implement `role="slider"`, `tabIndex={0}`, standard ARIA attributes (`valuenow`, `valuemin`, `valuemax`), and keyboard handlers (`ArrowKeys`) from the start.
