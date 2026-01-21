## 2024-05-22 - [The Invisible Fader]
**Learning:** Custom slider components (`div`s) are completely invisible to screen readers and keyboard users unless they explicitly implement the ARIA slider pattern.
**Action:** Always add `role="slider"`, `tabIndex={0}`, and `onKeyDown` handlers to custom interactive components.
