## 2024-05-23 - Path Traversal in Audio Serving Endpoint

**Vulnerability:** The `/api/audio/serve/[filename]` endpoint allowed accessing arbitrary files on the system via path traversal characters (e.g., `../../etc/passwd`) because it joined user input directly with `OUTPUTS_DIR` without validation.
**Learning:** Even when using `path.join`, verifying that the resolved path is contained within the intended directory using `path.resolve` and `.startsWith()` is critical for file serving endpoints.
**Prevention:** Always resolve paths to absolute paths and check against the allowed root directory before file access.
