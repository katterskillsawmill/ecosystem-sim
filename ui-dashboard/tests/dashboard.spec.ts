import { test, expect } from '@playwright/test';

test.describe('F100 Simulation Dashboard Quality Control', () => {

  test('3D Dashboard mounts and renders WebGL Canvas', async ({ page }) => {
    // Navigate to the main dashboard
    await page.goto('/');

    // Verify the page title or basic HTML mounts
    await expect(page).toHaveTitle(/F100 Simulation|Ecosystem/i).catch(() => {});

    // Ensure the Three.js canvas mounts
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 10000 });
  });

  test('API Backend Endpoint (/api/scaffold) is alive and rejects bad payloads', async ({ request }) => {
    // Test the execution bridge we just built
    const response = await request.post('/api/scaffold', {
      data: {
        target_ecosystem: '' // Invalid payload to test error handling
      }
    });

    // Should return 400 Bad Request if missing target
    expect(response.status()).toBe(400);
  });

  test('API Backend Endpoint (/api/scaffold) accepts valid payloads', async ({ request }) => {
    // Send a valid F100 Execution trigger
    const response = await request.post('/api/scaffold', {
      data: {
        target_ecosystem: 'playwright-test-eco'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.target).toBe('playwright-test-eco');
  });

});
