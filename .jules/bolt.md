## 2024-05-23 - [Optimization] Avoid Object Allocation in useFrame Loop
**Learning:** Instantiating objects (like `THREE.Color`) inside a `useFrame` loop (60fps) creates significant garbage collection pressure.
**Action:** Always memoize reusable Three.js objects (Vectors, Colors, Matrices) outside the loop using `useMemo` and update them in place.
