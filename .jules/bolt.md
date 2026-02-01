# Bolt Journal ⚡

## 2024-05-23 - Visualizer GC Pressure
**Learning:** Instantiating objects (like `THREE.Color`) inside `useFrame` loops causes significant Garbage Collection pressure at 60fps, leading to micro-stutters.
**Action:** Always hoist object instantiation out of the render loop using `useMemo` or module-level constants when possible.
