## 2026-01-15 - addLog Stability
**Learning:** The `addLog` function in `StudioPage` is passed to `useSonicEngine` and `LibraryPanel`. It acts as a critical dependency. If not memoized, it causes the engine to reset (polling restarts) and `LibraryPanel` to re-fetch/re-render excessively.
**Action:** Always wrap `addLog` in `useCallback` in `StudioPage` or any provider root to ensure referential stability for downstream consumers.
