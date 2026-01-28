## 2026-05-23 - [Three.js Object Instantiation in Render Loop]
**Learning:** Instantiating objects (like `new THREE.Color()`) inside a `useFrame` loop creates significant garbage collection pressure, leading to frame drops in WebGL components.
**Action:** Always memoize reusable Three.js objects (Vector3, Color, Matrix4) using `useMemo` and update them in place during the render loop.
