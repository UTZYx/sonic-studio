## 2026-02-18 - Three.js Object Reuse
**Learning:** Instantiating objects (Color/Vector3) inside `useFrame` loops causes massive GC pressure (e.g., 128 allocations per frame = 7680/sec).
**Action:** Always use `useMemo` to create reusable instances for Three.js objects used in render loops and update them in place (e.g., `color.setHSL(...)`).
