## 2026-01-18 - Accessibility in Custom Canvas-like Controls
**Learning:** Custom interactive components like `Knob` (often used in audio apps for "analog" feel) are frequently implemented as `div`s with only mouse events, completely excluding keyboard and screen reader users. They require manual implementation of `role="slider"`, `tabIndex`, and `onKeyDown` handlers to be accessible.
**Action:** When creating or auditing "pro" or "creative" tools (like mixers, editors), immediately check custom controls for keyboard navigability and ARIA roles.
