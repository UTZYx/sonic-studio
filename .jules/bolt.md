## 2024-05-22 - Visualizer Object Allocation Optimization
**Learning:** Instantiating objects (e.g., `new THREE.Color()`) inside a Three.js render loop (`useFrame`) creates significant garbage collection pressure (128 allocations per frame -> ~7680/sec).
**Action:** Reuse objects by memoizing them with `useMemo` outside the loop and updating their properties (e.g., `.setHSL()`) inside the loop using mutable methods.
