## 2024-05-23 - [Three.js Object Instantiation]
**Learning:** Instantiating objects (like `THREE.Color` or `THREE.Vector3`) inside `useFrame` loops creates significant garbage collection pressure (e.g., 7680 allocations/sec for 128 items @ 60fps).
**Action:** Always hoist reusable mutable objects into `useMemo` hooks outside the render loop and update them in place using methods like `.set()` or `.copy()`.
