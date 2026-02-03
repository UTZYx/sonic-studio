## 2024-05-22 - Three.js Object Instantiation
**Learning:** Instantiating objects (like `new THREE.Color()` or `new THREE.Vector3()`) inside a `useFrame` loop creates significant garbage collection pressure, leading to frame drops.
**Action:** Always use `useMemo` or `useRef` to create stable instances of mutable Three.js objects outside the render loop, and reuse them by calling their mutation methods (e.g., `setHSL`, `set`).
