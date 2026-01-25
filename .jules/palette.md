## 2024-05-22 - Accessible Custom Sliders
**Learning:** Custom slider components (like Knobs and Faders) implemented with `div`s are invisible to screen readers and keyboard users unless explicitly enhanced.
**Action:** Always add `role="slider"`, `tabIndex={0}`, ARIA range attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`), and an `onKeyDown` handler for standard keyboard interactions (Arrows, Page keys, Home/End) to all custom interactive controls.
