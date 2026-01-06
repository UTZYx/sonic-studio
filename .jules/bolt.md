## 2024-05-23 - [Hidden GC Pressure in Animation Loops]
**Learning:** React components using `useFrame` (from `@react-three/fiber`) execute code 60+ times per second. Allocating even small objects (like `new THREE.Color()`) inside these loops creates significant garbage collection pressure, leading to micro-stutters.
**Action:** Avoid per-frame allocations. Reuse objects (e.g., via `useMemo` or `useRef`) where possible.
**Nuance:** For `InstancedMesh`, reusing a single `THREE.Color` object is safe because `setColorAt` copies the RGB values into the instance buffer. For standard Materials, reusing a single Color object on `material.color` would link all meshes sharing that material. Always distinguish between *value copying* APIs and *reference holding* APIs.

## 2024-05-23 - [Effect Thrashing]
**Learning:** Defining helper functions inside a component without `useCallback` creates a new function identity on every render. If these functions are dependencies of a `useEffect` (e.g., a polling interval), the effect will teardown and re-initialize on every render ("Effect Thrashing").
**Action:** Stabilize the dependency chain. Wrap helpers in `useCallback` (ensuring their own dependencies are stable) or use a `useRef` to hold mutable callbacks if strict stability is needed without triggering re-runs.
