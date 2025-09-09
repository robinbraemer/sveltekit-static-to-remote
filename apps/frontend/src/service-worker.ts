// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const dev = self.location.hostname === 'localhost';

// Force service worker to activate immediately and claim all clients
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate new service worker immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Take control of all clients immediately
});

// Switch this to your production domain like api.example.com.
// For now this is the backend dev server.
const productionHost = 'localhost:5174';
// Switch this to true if your production domain has TLS.
const productionSecure = !dev;

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/_app/remote/')) return;

  const newUrl = new URL(event.request.url);
  newUrl.host = dev ? 'localhost:5174' : productionHost;
  newUrl.protocol = productionSecure ? 'https:' : 'http:';

  async function respond() {
    const req = event.request.clone();
    const headers = new Headers(req.headers);
    // Always mark as remote function call to ensure CORS headers
    headers.set('X-SvelteKit-Remote', 'true');

    const init: RequestInit = {
      method: req.method,
      headers,
      credentials: 'include',
      referrer: req.referrer,
      referrerPolicy: req.referrerPolicy,
      redirect: req.redirect,
      cache: req.cache,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = await req.blob();
    }

    return fetch(newUrl.toString(), init);
  }

  event.respondWith(respond());
});
