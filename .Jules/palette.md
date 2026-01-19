## 2026-01-05 - [Accessibility] Mixer Panel Improvements
**Learning:** The "Mixer" pattern in audio apps often uses icon-only buttons for density (Save, Solo, Mute). These are frequently missed in accessibility passes because they are "visual" controls. Adding `aria-label` is crucial, but `title` is also vital for mouse users who might not know what the icon means.
**Action:** When working on "high density" UI panels (like mixers or timelines), always audit icon-only buttons for both `title` (tooltip) and `aria-label` (screen reader).

## 2026-01-05 - [Visuals] The "Dissolved Layers" Log Pattern
**Learning:** Users perceive "loading" and "logging" as part of the system's "thought process". By styling logs as a transparent, scrolling terminal with distinct colors for system/error/success events, we turn "debug info" into a "trust-building UI".
**Action:** Use the `StreamConsole` pattern for any future system outputs. Ensure logs are parsed and color-coded, not just dumped as text.
