## 2026-02-18 - Timeline Component Optimization
**Learning:** The `Timeline` component was rendering segments inline, causing the entire list to re-render whenever a single segment was updated (e.g., typing in the prompt).
**Action:** Extracted segment rendering into a `TimelineItem` component wrapped in `React.memo`. Refactored `Timeline` handlers (`updateSegment`, etc.) to be stable using `useCallback` and functional state updates, ensuring that only the modified `TimelineItem` re-renders. This pattern should be applied to any list where items are editable in place.

## 2026-02-18 - Framer Motion with Memoized Components
**Learning:** When using `AnimatePresence` with a custom component (like `TimelineItem`), the component must use `forwardRef` to pass the ref to the underlying `motion` element. Without this, exit animations may fail or behave unpredictably.
**Action:** Ensure all memoized components involved in `AnimatePresence` transitions are wrapped in `forwardRef`.
