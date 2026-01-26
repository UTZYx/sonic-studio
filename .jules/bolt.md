## 2026-01-18 - Three.js Object Instantiation
**Learning:** Instantiating objects (like `THREE.Color`) inside `useFrame` loops creates significant garbage collection pressure (e.g., ~7680 allocations/sec at 60fps), which can cause frame drops in WebGL visualizers.
**Action:** Always memoize reusable Three.js objects (Vector3, Color, Euler) using `useMemo` outside the render loop and update them in place.
