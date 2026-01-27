## 2026-01-27 - Three.js Object Allocation in Render Loops
**Learning:** Instantiating objects (like `new THREE.Color`) inside `useFrame` loops causes massive garbage collection overhead (e.g., 7,680 allocations/sec for 128 instances at 60fps).
**Action:** Always use `useMemo` to create reusable instances for Three.js objects used in `useFrame` and update them in place using methods like `.setHSL()` or `.copy()`.
