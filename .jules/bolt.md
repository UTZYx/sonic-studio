## 2026-01-18 - [Render Cascade in Studio Layout]
**Learning:** `StudioPage` provides `LogContext` with a new value on every render (due to `addLog` recreation), forcing all consumers (like `LibraryPanel`) to re-render. Combined with inline mapping in `LibraryPanel`, this caused O(N) re-creation of `framer-motion` components on every keystroke in the prompt input.
**Action:** Always memoize context providers in the root layout components and extract list items to `memo` components when they contain expensive animations or heavy DOM.
