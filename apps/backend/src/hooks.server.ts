import type { Handle } from '@sveltejs/kit';

const ALLOWED_ORIGINS = [
    'http://localhost:5173', // frontend dev
    'http://localhost:3000', // frontend serve
    'https://yourdomain.com', // production frontend
    'capacitor://localhost', // Capacitor iOS
    'http://localhost', // Capacitor Android
    'tauri://localhost', // Tauri
];

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');
  const isRemoteCall = event.request.headers.has('X-SvelteKit-Remote');

  // Handle ALL OPTIONS preflight (browser sends before service worker intercepts)
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin || '')
          ? origin!
          : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'content-type,x-sveltekit-remote',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '600',
      },
    });
  }

  const res = await resolve(event);

  // Add CORS headers for remote function calls
  if (isRemoteCall && ALLOWED_ORIGINS.includes(origin || '')) {
    res.headers.set('Access-Control-Allow-Origin', origin!);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return res;
};
