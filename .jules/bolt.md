## 2026-05-21 - [WebGL Memory Churn]
**Learning:** Instantiating objects (like `new THREE.Color()`) inside a `useFrame` loop creates significant garbage collection pressure (e.g., 128 instances * 60fps = 7680 allocs/sec).
**Action:** Always reuse object instances (via `useMemo` or refs) for mutable calculations inside the render loop.
