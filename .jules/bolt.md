## 2026-01-25 - Three.js Object Pooling
**Learning:** Instantiating objects (like `THREE.Color`) inside a `useFrame` loop creates significant garbage collection pressure (e.g., 128 allocations * 60fps = 7680/sec).
**Action:** Always verify loops in `useFrame` and use `useMemo` to allocate reusable objects once, then update them in place.
