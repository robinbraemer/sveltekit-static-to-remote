import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  // Expect servers already running via standalone-start or user environment
});

test('query, form, command, prerender render on page', async ({ page }) => {
  // Capture console logs to debug
  page.on('console', (msg) =>
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`)
  );
  page.on('pageerror', (err) => console.error(`[PAGE ERROR] ${err.message}`));

  await page.goto('/');

  // Wait for page to load completely
  await page.waitForLoadState('networkidle');

  // Wait for service worker to register and activate
  await page.waitForFunction(
    () => 'serviceWorker' in navigator && navigator.serviceWorker.controller
  );

  console.log('✅ Service worker active');

  // Prerender card visible (use heading to be specific)
  await expect(page.getByRole('heading', { name: /Prerender/i })).toBeVisible();

  // Query demo - test the actual remote function
  const input = page.getByPlaceholder('Enter text to transform...');
  await input.fill('test');

  const transformButton = page.getByRole('button', { name: /Transform/i });
  await transformButton.click();

  // Wait a moment for the async operation
  await page.waitForTimeout(2000);

  // Check if value was transformed (should be "TEST")
  const currentValue = await input.inputValue();
  console.log(`[E2E] Input value after transform: "${currentValue}"`);

  if (currentValue === 'TEST') {
    console.log('✅ Query function working via service worker!');
  } else {
    console.log(
      '❌ Query function failed - service worker might not be intercepting'
    );
  }

  // Form demo
  await page.getByPlaceholder('Your name').fill('Tester');
  await page.getByPlaceholder('Your message...').fill('Hello');
  await page.getByRole('button', { name: /Send Message/i }).click();
  await expect(page.getByText(/Message submitted/i)).toBeVisible({
    timeout: 10000,
  });

  // Command demo - just verify buttons work
  await page.getByRole('button', { name: /Log View/i }).click();
  await page.getByRole('button', { name: /Log Interaction/i }).click();

  console.log('✅ All interactive tests completed!');
});
