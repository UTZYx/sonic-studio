## 2024-05-22 - Hidden Allocation in 3D Loops
**Learning:** Instantiating objects (like `new THREE.Color()`) inside a `useFrame` loop triggers rapid garbage collection, causing stutter even if the frame rate looks high.
**Action:** Always reuse mutable objects (Vector3, Color, Euler) by creating them once with `useMemo` or `useRef` and updating them in place.
