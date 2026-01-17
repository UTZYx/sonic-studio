## 2024-05-22 - [Refactoring State Setters for Memoization]
**Learning:** When passing state setters to memoized child components, standard `(value: T) => void` types in interfaces block the use of functional updates `(prev => next)` in parent callbacks.
**Action:** Always use `Dispatch<SetStateAction<T>>` for state setter props to enable stable `useCallback` implementations with functional updates.
