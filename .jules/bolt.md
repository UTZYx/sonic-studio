## 2024-05-23 - Trust But Verify Optimizations
**Learning:** Memory explicitly stated `Visualizer` reuses `THREE.Color`, but source code showed new allocation per loop iteration.
**Action:** Always verify claimed optimizations in source code before assuming they exist.
