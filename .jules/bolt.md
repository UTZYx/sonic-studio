# Bolt's Journal

## 2024-05-23 - Memory is Context, not Task
**Learning:** I initially thought I needed to implement things mentioned in memory, but I realized memory is just context. I must explore the *current* code state to find actual issues.
**Action:** Always verify the "what" (current code) before acting on the "why" (memory).

## 2024-05-23 - Three.js Allocation in useFrame
**Learning:** Found a textbook violation of the "Avoid per-frame allocation" rule in `Visualizer.tsx`. Creating `new THREE.Color()` 7680 times/sec (128 instances * 60fps) is a major GC thrashing source.
**Action:** Always check `useFrame` loops for `new` keywords. Use `useMemo` or module-scope variables for reuse.
