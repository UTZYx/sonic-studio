# Palette's Journal

## 2024-05-22 - Accessibility of Custom Inputs
**Learning:** Custom interactive components like Knobs and Faders are often implemented as `div`s without any semantic meaning, making them completely invisible to screen readers and keyboard users. Adding simple ARIA roles and keyboard handlers can transform a "mouse-only" fancy widget into a fully accessible control without changing its visual design.
**Action:** Always check custom "widget" components (knobs, sliders, toggles) for `role`, `tabIndex`, and keyboard event handlers.
