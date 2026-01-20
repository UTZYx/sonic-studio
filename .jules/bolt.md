## 2026-01-18 - Three.js Object Instantiation in Render Loops
**Learning:** Found `new THREE.Color()` being called inside `useFrame` loop in `Visualizer.tsx` (128 times per frame). This causes significant garbage collection pressure.
**Action:** Always use `useMemo` to create reusable Three.js objects (Vector3, Color, Euler, etc.) outside the render loop and update them in place.
