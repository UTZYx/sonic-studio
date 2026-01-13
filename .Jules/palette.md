# Palette's Journal

This journal documents critical UX and accessibility learnings. It is not a daily log, but a repository of insights to improve future design decisions.

## 2024-05-22 - [Pattern] Interactive Component Accessibility
**Learning:** Custom interactive components (Knob, Fader) implemented with `div` elements are often missing critical accessibility attributes, making them unusable for screen reader and keyboard users.
**Action:** Always enforce `role`, `tabIndex`, ARIA range attributes, and keyboard event handlers (`onKeyDown`) for any custom slider or control. Visual text labels should be hidden from screen readers (`aria-hidden`) if the component itself announces the value to prevent redundancy.
