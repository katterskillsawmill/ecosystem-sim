import { test, expect } from '@playwright/test';

test.describe('F100 TVP QC API Assertions', () => {
  test('Should GET /api/state and receive F100 HQ telemetry', async ({ request }) => {
    const response = await request.get('http://localhost:3135/api/state');
    expect(response.ok()).toBeTruthy();
    const state = await response.json();
    expect(state.tvp_verified).toBe(true);
    expect(state.entities.length).toBeGreaterThan(0);
  });

  test('Should POST /api/agent/chat and receive a physical Cursor subprocess execution', async ({ request }) => {
    const response = await request.post('http://localhost:3135/api/agent/chat', {
      data: {
        prompt: 'refactor this codebase using cursor',
        target_ecosystem: 'Main Umbrella Hub'
      }
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('SUCCESS');
    expect(data.reply).toContain('[CURSOR AGENT]');
  });
});
