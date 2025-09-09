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

// Switch this to your production domain like api.example.com.
// For now this is the backend dev server.
const productionHost = 'localhost:5174';
// Switch this to true if your production domain has TLS.
const productionSecure = !dev;

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (!url.pathname.startsWith('/_app/remote/')) return;
    console.log('fetch', event.request);
    url.host = dev ? 'localhost:5174' : productionHost;
    url.protocol = productionSecure ? 'https:' : 'http:';
    const newRequest = new Request(url, event.request);
    console.log('newRequest', newRequest);
    event.respondWith(fetch(newRequest));
});