## 2026-02-01 - Stability via Refs in Custom Hooks
**Learning:** When a callback in a custom hook (like `igniteSegment` in `useSonicEngine`) depends on a rapidly changing state (`timelineSegments`), it breaks memoization for all consumers, causing widespread re-renders.
**Action:** Use a `useRef` to store the latest state and access it inside the callback. This allows the callback to have zero dependencies (or stable ones) while still accessing the freshest data, ensuring `useCallback` returns a stable function identity.
