# Palette's Journal

## 2024-05-22 - Custom Slider Accessibility
**Learning:** Custom 'div'-based sliders (Knobs, Faders) often completely miss keyboard accessibility and screen reader support, alienating users.
**Action:** When creating custom inputs, immediately implement `role="slider"`, `tabIndex={0}`, `aria-valuenow`, and `onKeyDown` handlers for Arrow keys. Hide redundant visual text labels from screen readers using `aria-hidden="true"` to prevent double announcements.
