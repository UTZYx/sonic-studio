## 2026-02-02 - Three.js Object Allocation in useFrame
**Learning:** Instantiating objects (like `new THREE.Color()` or `new THREE.Vector3()`) inside a `useFrame` loop creates significant garbage collection pressure (e.g., 60 allocations per second * number of objects).
**Action:** Always reuse objects by creating them once with `useMemo` or `useRef` outside the render loop and updating their properties (e.g., `color.setHSL(...)`) instead of creating new instances.
