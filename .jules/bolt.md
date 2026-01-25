## 2024-05-22 - Framer Motion AnimatePresence with Custom Components
**Learning:** `AnimatePresence` cannot animate the exit of custom functional components unless they forward the ref to the underlying DOM node using `forwardRef`. If missing, the component disappears instantly without animation.
**Action:** Always wrap `motion`-animated custom components in `forwardRef` if they are direct children of `AnimatePresence`.

## 2024-05-22 - React.memo and Callback Stability
**Learning:** Extracting a list item to a `memo`ized component is ineffective if the event handlers passed to it are not referentially stable. Inline arrow functions or unstable callbacks in the parent defeat `memo`.
**Action:** Always use `useCallback` for handlers passed to memoized list items, and prefer functional state updates (e.g., `setX(prev => ...)`) to avoid dependency chains.
