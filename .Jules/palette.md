## 2026-01-26 - Accessibility in Custom Sliders
**Learning:** Custom slider components (like Fader) implemented with `div` elements are completely invisible to screen readers and keyboard users unless explicitly enhanced with `role="slider"`, `tabIndex={0}`, and ARIA range attributes.
**Action:** Always verify custom interactive components with keyboard navigation (Tab, Arrows) and ensure `role` and `aria-valuenow` are present during implementation.
