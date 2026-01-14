## 2024-05-23 - Timeline Re-render Optimization
**Learning:** React components rendering lists inline (e.g., `segments.map(...)`) cause all list items to re-render when the parent state changes, even if only one item was updated.
**Action:** Extract list items into a separate `memo`ized component (`TimelineSegmentItem`) and ensure all callbacks passed to it are stable using `useCallback` (with functional state updates) and `useRef` proxies for external unstable props.
