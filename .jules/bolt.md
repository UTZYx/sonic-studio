## 2024-05-22 - Allocations in useFrame Loops
**Learning:** The visualizer component was creating 128 new `THREE.Color` objects per frame inside the `useFrame` loop, causing excessive garbage collection pressure.
**Action:** When modifying Three.js components, always check `useFrame` loops for object instantiations and memoize mutable objects (like `THREE.Color`, `THREE.Vector3`) using `useMemo` outside the loop.
