## 2026-01-20 - Custom Control Accessibility
**Learning:** The project uses highly styled custom form controls (Knob, Fader, Switch) built with `div`s that completely lack semantic HTML, ARIA roles, and keyboard support, making them invisible to assistive technology.
**Action:** When encountering custom UI components in this codebase, assume they are inaccessible and prioritize adding `role`, `tabIndex`, and `onKeyDown` handlers to restore standard functionality.
