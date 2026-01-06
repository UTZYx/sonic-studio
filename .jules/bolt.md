## 2024-05-23 - [Three.js Object Reuse in useFrame]
**Learning:** `useFrame` loops run 60-120 times per second. Allocating objects (like `new THREE.Color()`) inside this loop causes rapid garbage collection pressure (GC thrashing).
**Action:** Always instantiate reuseable objects (Color, Vector3, Euler) in `useMemo` or `useRef` outside the loop.
**Nuance:** `InstancedMesh.setColorAt(i, color)` copies the *values* from the color object. If the API held a *reference* (like `material.color = myColor`), reusing the single object would make all instances the same color. Since `setColorAt` copies, reuse is safe and optimal.
