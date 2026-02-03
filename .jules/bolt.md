## 2025-05-22 - Three.js Object Instantiation in Render Loops
**Learning:** Instantiating objects like `THREE.Color` inside `useFrame` creates significant garbage collection pressure (e.g., 7680 allocations/sec for 128 instances).
**Action:** Always use `useMemo` or `useRef` to create stable instances of mutable Three.js objects outside the render loop and reuse them.
