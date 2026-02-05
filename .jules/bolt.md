# Bolt's Performance Journal

## 2024-05-22 - Three.js Object Instantiation in Render Loops
**Learning:** Instantiating objects (like `THREE.Color`) inside `useFrame` loops creates significant garbage collection pressure (e.g., ~7680 allocations/sec for 128 instances at 60fps).
**Action:** Always inspect `useFrame` loops for `new` keywords and hoist mutable objects using `useMemo` or `useRef` to reuse instances.
