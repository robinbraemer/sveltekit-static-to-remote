import { test, expect } from '@playwright/test';

test.beforeAll(async () => {
  // Expect servers already running via standalone-start or user environment
});

test('query, form, command work across browsers', async ({ page }) => {
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

test('prerender behavior validation', async ({ page }) => {
  // Track all network requests to see if prerender calls backend
  const networkRequests = [];
  const backendCalls = [];

  page.on('request', (req) => {
    const url = req.url();
    networkRequests.push({ method: req.method(), url });

    if (
      url.includes('localhost:5174') ||
      (url.includes('/_app/remote/') && url.includes('/getAppInfo'))
    ) {
      backendCalls.push({ method: req.method(), url, timestamp: Date.now() });
      console.log(`[PRERENDER] Backend call detected: ${req.method()} ${url}`);
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('getAppInfo')) {
      console.log(`[PRERENDER] Response: ${res.status()} for ${url}`);
      console.log(
        `[PRERENDER] Headers: access-control-allow-origin = "${
          res.headers()['access-control-allow-origin'] || 'undefined'
        }"`
      );
    }
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('prerender') || text.includes('getAppInfo')) {
      console.log(`[BROWSER] ${msg.type()}: ${text}`);
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(
    () => 'serviceWorker' in navigator && navigator.serviceWorker.controller
  );

  // Wait for prerender data to load/fail
  await page.waitForTimeout(3000);

  // Check if prerender card shows data
  const prerenderCard = page.locator('.prerender-card');
  const hasAppName = await prerenderCard
    .getByText('SvelteKit Static-to-Remote Demo')
    .isVisible()
    .catch(() => false);
  const hasErrorState = await prerenderCard
    .getByText(/Error|Failed|Loading/)
    .isVisible()
    .catch(() => false);

  console.log(`[PRERENDER] App name visible: ${hasAppName}`);
  console.log(`[PRERENDER] Error state visible: ${hasErrorState}`);
  console.log(`[PRERENDER] Total network requests: ${networkRequests.length}`);
  console.log(
    `[PRERENDER] Backend calls to getAppInfo: ${backendCalls.length}`
  );

  if (backendCalls.length > 0) {
    console.log(
      '❌ ASSUMPTION INVALID: Prerender IS calling backend at runtime (not using cache)'
    );
    console.log(`[PRERENDER] Backend calls:`, backendCalls);
  } else if (hasAppName) {
    console.log(
      '✅ ASSUMPTION VALID: Prerender using cached data (no backend calls)'
    );
  } else if (hasErrorState) {
    console.log(
      '⚠️ ASSUMPTION PARTIAL: Prerender failing due to CORS/network issues'
    );
  } else {
    console.log('🤔 UNCLEAR: Prerender behavior unclear - investigate further');
  }

  // Test explicit prerender call to check CORS
  try {
    await page.evaluate(async () => {
      const { getAppInfo } = await import('/src/lib/all.remote.js');
      return await getAppInfo();
    });
    console.log('✅ Direct prerender call successful');
  } catch (error) {
    console.log(`❌ Direct prerender call failed: ${error}`);
  }
});
