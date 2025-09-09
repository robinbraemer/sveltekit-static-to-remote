import type { Handle } from '@sveltejs/kit';

const ALLOWED_ORIGINS = [
  'http://localhost:5173', // frontend dev
  'http://localhost:3000', // frontend serve
  'http://localhost:3010', // tests serve
  'https://yourdomain.com', // production frontend
  'capacitor://localhost', // Capacitor iOS
  'http://localhost', // Capacitor Android
  'tauri://localhost', // Tauri
];

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');
  const isRemoteCall = event.request.headers.has('X-SvelteKit-Remote');
  const isRemotePath = event.url.pathname.startsWith('/_app/remote/');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  const isGetRequest =
    event.request.method === 'GET' || event.request.method === 'HEAD';

  // Handle OPTIONS preflight for remote function calls (needed when sending custom headers like X-SvelteKit-Remote)
  if (event.request.method === 'OPTIONS') {
    // Echo requested headers if provided, otherwise allow common ones
    const requestHeaders =
      event.request.headers.get('access-control-request-headers') ||
      'content-type,x-sveltekit-remote';
    const allowedOrigin = isAllowedOrigin ? origin! : ALLOWED_ORIGINS[0];

    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': requestHeaders,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
      },
    });
  }

  const res = await resolve(event);

  // Add CORS headers for remote function calls
  if (isRemoteCall || isRemotePath) {
    res.headers.append('Vary', 'Origin');

    if (isAllowedOrigin) {
      res.headers.set('Access-Control-Allow-Origin', origin!);
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (
      !origin &&
      (event.request.method === 'GET' || event.request.method === 'HEAD')
    ) {
      res.headers.set('Access-Control-Allow-Origin', '*');
      // Note: do not set Allow-Credentials with '*'
    } else if (
      origin &&
      (event.request.method === 'GET' || event.request.method === 'HEAD')
    ) {
      res.headers.set('Access-Control-Allow-Origin', origin);
    }
  }

  return res;
};
