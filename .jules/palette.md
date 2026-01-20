## 2026-01-20 - Custom Slider Accessibility
**Learning:** Custom slider components (Knob/Fader) implemented as divs often completely lack accessibility, making them invisible to screen readers and unusable for keyboard users.
**Action:** Always implement the `slider` role, `tabIndex={0}`, standard ARIA range attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`), and keyboard handlers (Arrow keys, Page keys, Home/End) when creating custom input controls.
