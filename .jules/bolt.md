## 2026-01-22 - Three.js Object Instantiation
**Learning:** `useFrame` loops run at 60fps. Instantiating objects (like `new THREE.Color()`) inside them causes massive GC pressure (e.g., ~7680 allocations/sec).
**Action:** Always reuse object instances (via `useMemo`) for temporary calculations in animation loops.
