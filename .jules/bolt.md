## 2024-05-22 - Hook Callback Stability Pattern
**Learning:** React hooks like `useSonicEngine` that rely on rapidly changing state (e.g., `timelineSegments`) often break referential stability of their return callbacks (`igniteSegment`). This forces downstream components to re-render unnecessarily, even if they are memoized.
**Action:** Use a `useRef` to hold the latest state and access `ref.current` inside the callback. This allows the callback to remain stable (no dependencies on the changing state) while still accessing the latest data.

## 2024-05-22 - Timeline Rendering Optimization
**Learning:** Rendering complex list items inline within a parent component (like `Timeline`) prevents `React.memo` optimization. Any state update in the parent (or list) causes the entire list to re-render.
**Action:** Extract list items into a separate component (`TimelineItem`), wrap it in `React.memo`, and ensure all props passed to it (especially callbacks) are stable using `useCallback` or stable refs.
