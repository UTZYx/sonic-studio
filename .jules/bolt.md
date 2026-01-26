# Bolt's Journal

## 2025-05-22 - [Three.js Object Instantiation]
**Learning:** Instantiating objects (like `new THREE.Color`) inside `useFrame` loops creates significant garbage collection pressure.
**Action:** Always use `useMemo` to create reusable instances outside the loop and update them in place.
