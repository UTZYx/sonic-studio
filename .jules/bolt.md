## 2024-05-23 - React Three Fiber Object Allocation
**Learning:** `useFrame` loops run at 60fps; instantiating objects (like `THREE.Color` or `THREE.Vector3`) inside these loops causes significant garbage collection churn.
**Action:** Always use `useMemo` or `useRef` to instantiate reusable Three.js objects outside the render loop and mutate them in place.
