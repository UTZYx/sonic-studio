## 2026-05-21 - Object Instantiation in useFrame
**Learning:** Instantiating objects (like `THREE.Color` or `THREE.Vector3`) inside a `useFrame` loop creates significant garbage collection pressure, causing frame drops.
**Action:** Always reuse instances via `useMemo` or refs and update them in place (e.g., `color.setHSL(...)`).
