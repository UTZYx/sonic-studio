## 2026-01-19 - Accessible Custom Sliders
**Learning:** Custom slider components built with `div`s require manual implementation of `role="slider"`, `tabIndex`, and keyboard event handling (`onKeyDown`) to be accessible. Visual labels should be hidden from screen readers to avoid redundancy when `aria-label` is used.
**Action:** Always verify custom controls with keyboard-only navigation (Arrows, Page keys, Home/End) and ensure focus states (`focus-visible`) are implemented.
