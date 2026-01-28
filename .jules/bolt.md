## 2026-01-20 - [Performance] Object Instantiation in useFrame
**Learning:** Instantiating `new THREE.Color()` inside a `useFrame` loop (running 60fps x 128 instances) causes significant GC pressure.
**Action:** Always memoize reusable objects (Vector3, Color, etc.) used inside `useFrame` loops.
