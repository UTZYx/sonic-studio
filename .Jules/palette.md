## 2026-01-18 - Accessibility in Custom Canvas/Div Controls
**Learning:** Custom UI components like Knobs and Faders built with `div`s or Canvas are often invisible to screen readers and keyboard users.
**Action:** Always enforce `role="slider"`, `tabIndex={0}`, and `aria-valuenow` on the interactive container. Implement `onKeyDown` handlers for Arrow keys to ensure functional parity with mouse users.
