## 2026-02-18 - Three.js Object Instantiation Loop
**Learning:** Instantiating objects (like `new THREE.Color()` or `new THREE.Vector3()`) inside a `useFrame` loop causes significant garbage collection pressure, leading to frame drops.
**Action:** Always reuse object instances (via `useMemo` or `useRef`) and update them in place using methods like `.set()`, `.copy()`, or `.setHSL()`.
