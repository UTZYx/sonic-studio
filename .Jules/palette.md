## 2026-01-18 - Visual-First Component Pattern & Accessibility Gaps
**Learning:** Core UI components (`Switch`, `Knob`) were implemented as pure visual elements (`div`s with mouse events) lacking semantic roles and keyboard support. This renders them invisible to screen readers and unusable for keyboard-only users.
**Action:** Systematically audit and retrofit all `src/components/ui` primitives with ARIA roles and keyboard handlers before using them in feature work.
