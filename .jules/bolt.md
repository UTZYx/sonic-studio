## 2026-01-18 - Three.js Object Instantiation in Loops
**Learning:** Found significant GC pressure in `Visualizer.tsx` where `new THREE.Color()` was being called 128 times per frame inside `useFrame`. This creates ~7680 objects/sec.
**Action:** Always check `useFrame` loops for object instantiation. Use `useMemo` to create a single reusable instance outside the loop for mutable Three.js objects like `Color`, `Vector3`, etc.
