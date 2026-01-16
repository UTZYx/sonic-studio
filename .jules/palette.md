# Palette Journal

## 2024-05-23 - Custom Slider Accessibility Pattern
**Learning:** Custom interactive components like Knobs and Faders implemented with divs are invisible to screen readers and keyboard users by default. They require manual implementation of the "slider" pattern.
**Action:** When creating custom sliders:
1. Add `role="slider"` and `tabIndex={0}`.
2. Add ARIA attributes: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`.
3. Implement `onKeyDown` for Arrows (5% step), Page keys (20% step), and Home/End.
4. Add visible focus styles (e.g., `focus-visible:ring`).
