## 2026-01-19 - Three.js Object Reusability
**Learning:** `useFrame` loops in this codebase were instantiating new `THREE.Color` objects every frame, leading to significant GC pressure (7600+ allocs/sec).
**Action:** Always use `useMemo` to instantiate reusable Three.js objects (Vector3, Color, Euler) outside the render loop and update them in place.
