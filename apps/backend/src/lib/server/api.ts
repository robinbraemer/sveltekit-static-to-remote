import { query, form, command, prerender } from '$app/server';
import { z } from 'zod/v4';

// 1. QUERY - Read dynamic data from server
export const toUpper = query(z.string(), async (input) => {
  console.log('backend: toUpper (query)', input);
  console.log(
    'You should see this in your backend console. If not click on "Update" in the service worker tab in devtools and reload the page.'
  );
  return input.toUpperCase();
});

// 2. FORM - Write data to server (follows official SvelteKit pattern)
export const createMessage = form(async (data) => {
  const name = data.get('name');
  const message = data.get('message');

  // Validate data (as shown in SvelteKit docs)
  if (typeof name !== 'string' || typeof message !== 'string') {
    console.log('backend: Invalid form data');
    throw new Error('Name and message are required');
  }

  console.log('backend: Creating message from:', name);

  // Simulate database operation
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return success - in real app you might redirect()
  return {
    success: true,
    name,
    message,
    id: Math.random().toString(36).substr(2, 9),
  };
});

// 3. COMMAND - Perform actions without returning data to client
export const logActivity = command(z.string(), async (action) => {
  console.log('backend: Activity logged:', action);

  // Simulate analytics/monitoring
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Commands don't return data to client
});

// 4. PRERENDER - Static data generated at build time
export const getAppInfo = prerender(async () => {
  console.log('backend: Generating app info at build time');

  return {
    name: 'SvelteKit Static-to-Remote Demo',
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    features: ['Query', 'Form', 'Command', 'Prerender'],
  };
});
