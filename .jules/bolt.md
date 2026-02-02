## 2025-05-18 - Hidden Allocations in 3D Loops
**Learning:** Instantiating objects (like `new THREE.Color()`) inside `useFrame` loops creates massive garbage collection pressure (e.g., 7680 allocations/sec for 128 items at 60fps), causing stutter.
**Action:** Always use `useMemo` to create a single reusable instance outside the loop, and update its properties (e.g., `color.setHSL()`) inside the loop.
