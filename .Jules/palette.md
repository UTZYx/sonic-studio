## 2024-05-22 - Replacing Alerts with Micro-Interactions
**Learning:** The "Promote to Archive" feature used `window.alert()` for success feedback, which interrupted the user flow and felt jarring.
**Action:** Replaced `alert()` with an inline state change (Star -> Check icon) that reverts after 2 seconds. This provides clear feedback without blocking the UI, a pattern that should be preferred for all non-critical success notifications.
