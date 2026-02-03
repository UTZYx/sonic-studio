## 2026-01-24 - Custom Component Accessibility Gap
**Learning:** Custom interactive components like Knobs often miss standard accessibility features (keyboard support, ARIA roles), creating a hidden barrier for users despite looking "finished" visually.
**Action:** When auditing UI libraries, prioritize checking custom inputs (sliders, switches) for `onKeyDown` handlers and `focus-visible` states, not just mouse events.
