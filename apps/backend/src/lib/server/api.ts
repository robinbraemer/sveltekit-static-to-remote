import { query, form, command, prerender } from '$app/server';
import { z } from 'zod/v4';

// 1. QUERY - Simple remote function that makes the point.
export const toUpper = query(z.string(), async (input) => {
  console.log('backend: toUpper (query)', input);
  console.log('You should see this in your backend console. If not click on "Update" in the service worker tab in devtools.');
  return input.toUpperCase();
});

// 2. FORM - Handle form submissions with FormData
export const submitMessage = form(async (formData) => {
  const name = formData.get('name')?.toString();
  const message = formData.get('message')?.toString();

  // Validate the form data (as shown in SvelteKit docs)
  if (!name || typeof name !== 'string') {
    console.log('backend: submitMessage (form) - Invalid name');
    throw new Error('Name is required');
  }
  
  if (!message || typeof message !== 'string') {
    console.log('backend: submitMessage (form) - Invalid message');
    throw new Error('Message is required');
  }

  console.log('backend: submitMessage (form)', { name, message });
  console.log('Form submitted with name:', name, 'message:', message);

  // Simulate saving to database
  await new Promise((resolve) => setTimeout(resolve, 500));

  const messageId = Math.random().toString(36).substr(2, 9);
  
  console.log('backend: Message saved with ID:', messageId);
  
  // In a real app, you might redirect to a success page
  // For this demo, we'll just return success data
  // Note: SvelteKit form functions can use redirect() as shown in docs
  
  return {
    success: true,
    id: messageId,
    submittedAt: new Date().toISOString(),
    data: { name, message },
  };
});

// 3. COMMAND - Perform actions without returning data
export const logActivity = command(
  z.object({
    action: z.string(),
    userId: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
  async (data) => {
    console.log('backend: logActivity (command)', data);
    console.log('Activity logged:', data.action);

    // Simulate logging to analytics/monitoring service
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Commands don't return data to the client
  }
);

// 4. PRERENDER - Static data that can be prerendered
export const getStaticInfo = prerender(
  z.string().optional(), // Optional parameter for different info types
  async (type = 'default') => {
    console.log('backend: getStaticInfo (prerender)', type);

    const staticData = {
      default: {
        appName: 'SvelteKit Static-to-Remote Demo',
        version: '1.0.0',
        features: ['Remote Functions', 'Service Workers', 'Cross-deployment'],
        generatedAt: new Date().toISOString(),
      },
      stats: {
        totalUsers: 1337,
        totalProjects: 42,
        successRate: 99.9,
        generatedAt: new Date().toISOString(),
      },
    };

    return staticData[type as keyof typeof staticData] || staticData.default;
  },
  {
    // This data can be prerendered since it's relatively static
    dynamic: false,
    inputs: () => ['default', 'stats'], // Prerender both variants
  }
);
