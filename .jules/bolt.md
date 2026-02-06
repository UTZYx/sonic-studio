## 2026-02-06 - [Three.js Object Instantiation in Loops]
**Learning:** `Visualizer.tsx` was creating 128 `THREE.Color` objects per frame inside `useFrame`, leading to high GC pressure (7000+ allocs/sec).
**Action:** Always memoize mutable Three.js objects (Vector3, Color, Euler) using `useMemo` outside the render loop and reuse them.
