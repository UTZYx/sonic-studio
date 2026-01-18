# Bolt's Journal

## 2025-02-23 - Three.js Object Re-use Pattern
**Learning:** `useFrame` loops execute 60 times per second. Allocating objects (like `new THREE.Color()`) inside this loop causes massive Garbage Collection pressure (e.g., 7,680 allocs/sec for 128 instances).
**Action:** Always hoist object creation out of `useFrame` using `useMemo` or refs. For APIs like `setColorAt` that copy values (rather than storing references), reusing a single helper object is safe and highly efficient.
