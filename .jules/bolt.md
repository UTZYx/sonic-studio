## 2026-01-18 - Timeline Render Bottleneck
**Learning:** Inline mapping of complex list items (like the Timeline segments with inputs and layers) combined with unstable event handlers causes O(n) re-renders on every keystroke. This destroys typing latency and responsiveness.
**Action:** Extract list items to memoized components (`React.memo`) and ensure all callbacks passed to them are stable (`useCallback`). This restores O(1) updates for text inputs.
