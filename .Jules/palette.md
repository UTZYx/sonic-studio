## 2025-02-18 - [Accessibility for Custom Sliders]
**Learning:** Custom interactive elements like `div`-based knobs are invisible to screen readers and keyboard users unless explicitly enhanced. Using `role="slider"`, `tabIndex={0}`, and mapping Arrow/Page keys to value changes transforms a purely visual component into a fully accessible one without compromising the design.
**Action:** Always wrap custom input logic in `onKeyDown` handlers and ensure focus indicators (`focus-visible`) are present but unobtrusive for mouse users.
