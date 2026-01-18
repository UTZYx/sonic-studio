## 2026-01-17 - [Virtualized Timeline Rendering]
**Learning:** React's `memo` is ineffective if parent callbacks are unstable. When extracting list items for performance, parent handlers *must* use `useCallback` and functional state updates (e.g., `setSegments(prev => ...)`) to avoid dependency on the changing state itself, ensuring props remain stable across renders.
**Action:** Always refactor parent handlers to use functional updates before memoizing child components.
