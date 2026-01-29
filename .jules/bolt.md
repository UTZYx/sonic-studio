## 2024-05-22 - [Three.js Object Instantiation]
**Learning:** Instantiating objects (like `THREE.Color`, `THREE.Vector3`) inside `useFrame` loops creates significant garbage collection pressure (e.g., 7000+ objects/sec at 60fps).
**Action:** Always create reusable instances via `useMemo` outside the render loop and update them in place using methods like `.set()`, `.setHSL()`, or `.copy()`.
