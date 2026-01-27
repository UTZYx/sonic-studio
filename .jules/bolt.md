## 2026-01-20 - Three.js Memory Allocation in Render Loops
**Learning:** Instantiating objects (like `THREE.Color`) inside `useFrame` loops causes significant garbage collection pressure and frame drops.
**Action:** Always memoize reuseable objects outside the render loop and update them in place.
