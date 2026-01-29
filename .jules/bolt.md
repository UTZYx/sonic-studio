## 2026-01-20 - GC Pressure in Animation Loops
**Learning:** Instantiating objects (like `THREE.Color`) inside `useFrame` loops causes significant Garbage Collection pressure, leading to frame drops in WebGL visualizers.
**Action:** Always reuse object instances (via `useMemo` or `useRef`) for temporary calculations inside render loops.
