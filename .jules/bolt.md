# Bolt's Journal

## 2024-05-22 - Visualizer Object Allocation
**Learning:** `useFrame` loops in Three.js are critical hot paths. Allocating objects (like `new THREE.Color()`) inside these loops causes significant garbage collection pressure, leading to frame drops.
**Action:** Always hoist object instantiation outside the render loop or use `useMemo` for temporary objects used in calculations.
