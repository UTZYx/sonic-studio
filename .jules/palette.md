## 2026-05-21 - Custom Input Accessibility
**Learning:** The application utilizes custom `div`-based input controls (Knobs, Faders) that are visually rich but functionally invisible to keyboard users and screen readers, creating a major accessibility gap in the "Studio" experience.
**Action:** When identifying custom interactive components, immediately audit for `role`, `tabIndex`, and keyboard event handlers (`onKeyDown`) to ensure inclusive design.
