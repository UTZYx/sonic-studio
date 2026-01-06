# AWARENESS JOURNAL

> "The studio is for ignition. The archive is for memory."

This journal records the insights, mental maps, and structural realizations discovered through the **Awareness Layer**.

---

## Session Log

### 2026-01-06 – Polling + GPU Blocking Are Hidden System Taxes
**Signal:** CPU audio mixing + setInterval polling create constant low-grade load and "annoying" friction.
**Structural:** Job-based async flow is blurred with direct generation, making performance ownership unclear.
**Innovation:** "Cache intent" (send mix params, not mixed audio) could reduce payload movement; evaluate as a flagged experiment.
**Resilience:** GPU generation can hang under concurrency; needs gating (semaphore/queue) to avoid stall failure mode.
**Action:** First micro-boost: conditional polling + abort + backoff. Next: GPU semaphore to prevent concurrent hang.
