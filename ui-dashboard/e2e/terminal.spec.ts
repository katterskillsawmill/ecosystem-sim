import { test, expect } from '@playwright/test';

test.describe('F100 3D Terminal Marathon Execution', () => {
  test('Should inject command into the React Terminal and verify Python API response', async ({ page }) => {
    // Navigate to the Next.js Simulation Engine
    await page.goto('http://localhost:3000');

    // Wait for the WebGL canvas to mount
    await page.waitForSelector('.canvas-container');

    // The user clicks the [ENTER FULLSCREEN] breakout button
    const fullscreenBtn = page.getByText('[ENTER FULLSCREEN]');
    await fullscreenBtn.click();

    // Verify the UI entered fullscreen mode
    await expect(page.getByText('[EXIT FULLSCREEN]')).toBeVisible();

    // The user clicks on the Terminal 
    // Since R3F HTML overlays might be tricky to target, we look for the system online text
    await expect(page.getByText('SYSTEM ONLINE. WAITING FOR DIRECTIVE.')).toBeVisible();

    // We locate the terminal input field and type the workflow trigger
    const terminalInput = page.locator('input[type="text"]');
    await terminalInput.click();
    await terminalInput.fill('refactor this codebase using cursor');
    await terminalInput.press('Enter');

    // The terminal should immediately log the Transmitting string
    await expect(page.getByText('[SYSTEM] Transmitting prompt to F100 Agent Roster...')).toBeVisible();

    // We wait for the Python backend to route the prompt to the CursorHeadlessActor and return the subprocess logs
    await expect(page.getByText('[CURSOR AGENT] Headless refactoring complete.', { exact: false })).toBeVisible({ timeout: 10000 });
    
    console.log('OODA Loop E2E Verification Complete.');
  });
});
