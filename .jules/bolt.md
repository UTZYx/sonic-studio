## 2024-05-23 - Visualizer Garbage Collection
**Learning:** Instantiating objects (like `THREE.Color`) inside a `useFrame` loop triggers rapid garbage collection, causing stutter in animations.
**Action:** Always reuse Three.js objects (Vector3, Color, Matrix4) by creating them once with `useMemo` or `useRef` and updating them in place.
