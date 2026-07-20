# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> F100 Simulation Dashboard Quality Control >> 3D Dashboard mounts and renders WebGL Canvas
- Location: tests/dashboard.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('canvas').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('canvas').first()

```

```yaml
- banner:
  - img "Cooper Lux"
  - text: COOPER LUX ELITE TVP VERIFIED DCoop Constellation OODA LOOP STANDBY
- main:
  - complementary:
    - heading "Domain Synthesizer" [level=2]
    - text: Natural Language Input
    - textbox "e.g. Simulate a 500-bed hospital ER during a power outage...": Simulate the DCoop Constellation with 500 active agents
    - button "Compile ECS Rules"
    - button "2D Topology"
    - button "3D HQ"
    - heading "Active Metrics" [level=2]
    - text: Tick Rate 60 Hz Entities 50 Core Rust FFI Load 12.4%
  - text: "Live Execution: DCoop Constellation Engine Active"
  - button "[ENTER FULLSCREEN]"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('F100 Simulation Dashboard Quality Control', () => {
  4  | 
  5  |   test('3D Dashboard mounts and renders WebGL Canvas', async ({ page }) => {
  6  |     // Navigate to the main dashboard
  7  |     await page.goto('/');
  8  | 
  9  |     // Verify the page title or basic HTML mounts
  10 |     await expect(page).toHaveTitle(/F100 Simulation|Ecosystem/i).catch(() => {});
  11 | 
  12 |     // Ensure the Three.js canvas mounts
  13 |     const canvas = page.locator('canvas');
> 14 |     await expect(canvas.first()).toBeVisible({ timeout: 10000 });
     |                                  ^ Error: expect(locator).toBeVisible() failed
  15 |   });
  16 | 
  17 |   test('API Backend Endpoint (/api/scaffold) is alive and rejects bad payloads', async ({ request }) => {
  18 |     // Test the execution bridge we just built
  19 |     const response = await request.post('/api/scaffold', {
  20 |       data: {
  21 |         target_ecosystem: '' // Invalid payload to test error handling
  22 |       }
  23 |     });
  24 | 
  25 |     // Should return 400 Bad Request if missing target
  26 |     expect(response.status()).toBe(400);
  27 |   });
  28 | 
  29 |   test('API Backend Endpoint (/api/scaffold) accepts valid payloads', async ({ request }) => {
  30 |     // Send a valid F100 Execution trigger
  31 |     const response = await request.post('/api/scaffold', {
  32 |       data: {
  33 |         target_ecosystem: 'playwright-test-eco'
  34 |       }
  35 |     });
  36 | 
  37 |     expect(response.status()).toBe(200);
  38 |     const body = await response.json();
  39 |     expect(body.success).toBe(true);
  40 |     expect(body.target).toBe('playwright-test-eco');
  41 |   });
  42 | 
  43 | });
  44 | 
```