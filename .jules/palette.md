## 2024-05-23 - Custom Interactive Components Accessibility
**Learning:** Custom interactive components like `Knob` and `Fader` (implemented via divs and mouse events) are invisible to screen readers and keyboard users by default.
**Action:** When creating custom controls, always wrap them in or add `role="slider"`, `tabIndex={0}`, and appropriate ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`) to ensure they are perceivable and operatable. Future improvements should add keyboard event handlers (ArrowUp/ArrowDown) to fully support keyboard interaction.
