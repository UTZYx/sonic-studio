# Bolt's Journal

## 2024-05-22 - Timeline Performance
**Learning:** The `Timeline` component was causing full list re-renders on every segment update because `TimelineItem` wasn't memoized.
**Action:** Wrapped `TimelineItem` in `React.memo` and ensured props (callbacks) are stable using `useCallback`.

## 2024-05-23 - Visualizer Garbage Collection
**Learning:** Creating new `THREE.Color` or `THREE.Vector3` objects inside the `useFrame` loop causes significant garbage collection churn.
**Action:** Use `useMemo` or static constants to reuse Three.js objects instead of creating new ones every frame.

## 2024-05-24 - Library Panel Re-renders
**Learning:** `LibraryPanel` was re-rendering all rows when one item played.
**Action:** Extracted `LibraryItem` to a memoized component.
