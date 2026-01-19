## 2026-02-12 - Three.js Object Instantiation

**Learning:** Instantiating `THREE.Color` (or `Vector3`, `Matrix4`, etc.) inside a `useFrame` loop causes significant garbage collection pressure, leading to frame drops in long-running visualizations.
**Action:** Always memoize these objects outside the loop using `useMemo` or `useRef` and update them in place (e.g., `color.setHSL(...)` instead of `new THREE.Color(...)`).
