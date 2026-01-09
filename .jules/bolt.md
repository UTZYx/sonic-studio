## 2024-05-23 - [Frontend Allocation Pattern]
**Learning:** Recreating objects like `THREE.Color` inside a `useFrame` loop causes significant garbage collection overhead (128 instances * 60fps = 7680 allocations/sec).
**Action:** Always reuse object instances for value updates in animation loops using `useMemo` or refs.
