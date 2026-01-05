
import { test, expect } from '@playwright/test';

test.describe('Sonic Studio E2E', () => {
  test('should load the studio and ignite a job', async ({ page }) => {
    // 1. Navigate to Studio
    await page.goto('/studio');
    // Title is "Sonic Space | UTZYx"
    await expect(page).toHaveTitle(/Sonic Space/);

    // 2. Check Initial State
    const igniteBtn = page.locator('#ignite-trigger');
    await expect(igniteBtn).toBeVisible();
    await expect(igniteBtn).toBeEnabled();

    // 3. Verify Tempo Control (New Feature)
    // Only visible in Music Mode, so switch to Music
    const musicModeBtn = page.getByText('Music', { exact: true }).first(); // Adjust selector based on actual rendering
    if (await musicModeBtn.isVisible()) {
        await musicModeBtn.click();
        const bpmKnob = page.locator('text=BPM'); // Simplistic check for label
        await expect(bpmKnob).toBeVisible();
    }

    // 4. Simulate Ignition (Mocking API)
    await page.route('/api/audio/jobs', async route => {
        const json = { ok: true, jobId: 'test-job-123' };
        await route.fulfill({ json });
    });

    // Mock polling
    await page.route('/api/audio/jobs/test-job-123', async route => {
        await route.fulfill({
            json: {
                status: 'completed',
                type: 'music',
                result: { url: 'https://example.com/audio.wav' },
                metadata: { provider: 'cloud-hf' }
            }
        });
    });

    // Click Ignite
    await igniteBtn.click();

    // 5. Verify Status Change
    await expect(page.getByText('Job Created: test-job-123')).toBeVisible();

    // Wait for completion (simulated)
    await expect(page.getByText('Music Track Ready')).toBeVisible();
  });
});
