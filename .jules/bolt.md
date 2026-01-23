## 2024-05-23 - Reuse Objects in Three.js Render Loop
**Learning:** Instantiating objects (like `THREE.Color` or `THREE.Vector3`) inside a `useFrame` loop creates significant garbage collection pressure, as the loop runs 60 times per second.
**Action:** Always use `useMemo` to create a reusable instance of the object outside the loop, and update it in place using methods like `setHSL` or `copy`.