## 2025-02-18 - Accessible Custom Sliders
**Learning:** Custom `div`-based sliders (Knobs/Faders) completely lack keyboard support and semantic roles, making them invisible to screen readers and unusable for keyboard-only users.
**Action:** Always implement `role="slider"`, `tabIndex`, and `onKeyDown` handlers when building custom input controls. Use `aria-hidden` on redundant visual labels.
