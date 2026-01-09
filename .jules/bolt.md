## 2024-05-23 - [Smart Polling]
**Learning:** Naive `setInterval` polling creates constant network noise ("Effect Thrashing" on the network layer). For long-running tasks like generative AI, using an adaptive strategy (Recursive `setTimeout` with Backoff) reduces server load significantly while maintaining perceived responsiveness.
**Action:** Replace `setInterval` with recursive `setTimeout` where the delay increases over time (e.g., 1s -> 2s -> 4s) or stays constant but avoids overlapping requests (preventing race conditions).
