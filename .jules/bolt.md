# Bolt's Journal

## 2025-05-23 - Memory Allocation in Render Loops
**Learning:** React Three Fiber's `useFrame` runs 60 times per second, so even small object allocations (like `new THREE.Color()`) inside the loop can accumulate to thousands of objects per second, causing GC stutter.
**Action:** Always verify if `THREE` objects (Vector3, Color, Euler) created in `useFrame` can be reused via `useMemo` or a module-level constant.
