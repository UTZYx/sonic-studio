## 2026-01-23 - Visualizer Object Allocation
**Learning:** Found `new THREE.Color()` instantiated inside `useFrame` loop (7k+ allocs/sec). React Three Fiber render loops must avoid object creation.
**Action:** Use `useMemo` to create reusable instances (Vector3, Color, etc.) outside the loop and update them in place.
