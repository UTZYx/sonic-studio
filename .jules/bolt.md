## 2024-05-23 - [Hidden GC Pressure in Animation Loops]
**Learning:** React components using `useFrame` (from `@react-three/fiber`) execute code 60+ times per second. Allocating even small objects (like `new THREE.Color()`) inside these loops creates significant garbage collection pressure, leading to micro-stutters that are hard to debug.
**Action:** Always hoist object allocations out of `useFrame` loops, either to module scope (if stateless) or `useMemo`/`useRef` (if stateful).
