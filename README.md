# SvelteKit Static-to-Remote

> **A demo showcasing how to call SvelteKit remote functions from a static frontend to a separate backend deployment**

This repository demonstrates an innovative approach to using [SvelteKit remote functions](https://svelte.dev/docs/kit/remote-functions) across different deployments. It shows how a **statically-built frontend** can call remote functions that are actually executed on a **separate backend server**.

## 🎯 The Problem This Solves

Normally, SvelteKit remote functions only work within the same deployment. But what if you want to:

- Deploy your frontend as a static site (CDN, GitHub Pages, etc.)
- Build mobile apps with Tauri or Capacitor (which require static builds)
- Keep your backend logic on a separate server
- Still use the elegant remote function API instead of manual fetch calls

This demo shows you how! 🚀

## 🏗️ Project Structure

```text
sveltekit-static-to-remote/
├── apps/
│   ├── frontend/          # Static SvelteKit app (calls remote functions)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── all.remote.ts      # 👈 Same path as backend!
│   │   │   ├── routes/
│   │   │   └── service-worker.ts      # 👈 The magic happens here
│   │   └── build/                     # Static build output
│   └── backend/           # Backend SvelteKit app (executes remote functions)
│       └── src/
│           └── lib/
│               ├── all.remote.ts      # 👈 Same path as frontend!
│               └── server/
│                   └── api.ts         # Actual function implementations
└── README.md
```

> **📝 Note on Remote File Structure**: We use a single `all.remote.ts` file to re-export all remote functions for simplicity. You _could_ have multiple remote files like `lib/users.remote.ts`, `lib/orders.remote.ts`, etc., but you'd need to ensure each file exists at the **exact same path** in both apps (since the hash is based on file path). Using a single `all.remote.ts` file simplifies maintenance and reduces the chance of path mismatches between frontend and backend.

## 🚀 Quick Start

1. **Clone and install:**

   ```bash
   git clone https://github.com/robinbraemer/sveltekit-static-to-remote.git
   cd sveltekit-static-to-remote
   pnpm install
   ```

2. **Start the backend:**

   ```bash
   cd apps/backend
   pnpm dev  # Runs on http://localhost:5174
   ```

3. **Build and serve the frontend:**

   ```bash
   cd apps/frontend
   pnpm build
   pnpx serve build  # Better simulation of static hosting
   ```

4. **Test it out:**
   - Open <http://localhost:3000> in your browser (or whichever port `serve` displays)
   - Enter some text and click "Convert to UPPERCASE"
   - The function executes on the backend but feels seamless from the frontend! ✨

## 🔧 Troubleshooting

### Service Worker Not Intercepting Requests

If you don't see the backend console message `"You should see this in your backend console."`, the service worker is likely not registered properly:

1. **Open Browser DevTools** (F12 or right-click → Inspect)
2. **Go to Application tab** (Chrome/Edge) or **Storage tab** (Firefox)
3. **Find Service Workers** in the sidebar
4. **Click "Update"** next to your service worker
5. **Reload the page** and try again

> **💡 Pro Tip**: During development, service workers don't always hot-reload seamlessly when you change the code. The manual update + reload usually fixes it on the first try!

### Other Common Issues

- **CORS Errors**: Make sure your backend is running and accessible
- **Wrong Port**: Check that your service worker's `productionHost` or dev port matches your backend
- **Network Tab**: Use DevTools → Network to see if requests are being redirected to the correct backend URL

## 🔧 How (and Why) This Cross-App Remote Function Calling Works

### The Secret: The Hash Is Based on the File Path

SvelteKit's [remote functions](https://svelte.dev/docs/kit/remote-functions) serialize calls to your remote function files (e.g., `.remote.ts`) via a generated URL that includes a hash:

```text
/_app/remote/[HASH]/call
```

**The key detail:**

> **The `[HASH]` part is determined only by the _project-relative path_ of the remote function file. It uses a simple hash function over the file's path, not the code inside.**

#### Technically, in the SvelteKit source

- The hash for each remote function is created here:  
  [`sveltejs/kit/src/utils/hash.js`](https://github.com/sveltejs/kit/blob/main/packages/kit/src/utils/hash.js)
- The code that generates the hash for remote function endpoints is located here:  
  [`sveltejs/kit/src/core/sync/create_manifest_data/index.js`](https://github.com/sveltejs/kit/blob/main/packages/kit/src/core/sync/create_manifest_data/index.js)

**Relevant source snippet:**

```js
// (from create_manifest_data/index.js)
remotes.push({
  hash: hash(posixified),
  file: posixified,
});
```

> `hash()` is imported from `utils/hash.js` and the value is the file path as seen by the build tool.

### How to Guarantee the Hashes Match

To make the hashes (and thus the remote endpoint URLs) **identical in both the backend and the static frontend**, simply ensure that **the remote file path is the same in both projects**.

#### Example: The Common Pattern (`all.remote.ts`)

- Place a file called `all.remote.ts` (or some other name/location you agree on) in the _same_ relative path in both the backend and frontend projects.
  - E.g: `src/lib/all.remote.ts`
- Now, when SvelteKit builds _both_ projects, the hash generated for that file will be identical.
- The frontend can _import_ this file (it doesn't matter if it's a stub for the frontend!), and use the generated remote call structure; the static app's code knows the hash and URL it should POST to, and—crucially—it will match the backend's actual endpoint.

### Cross-Origin Solution: Service Worker URL Rewriting

Since the static frontend deploys to a different host/origin than the backend, but both generate the same hash in their remotes, all you need to do is:

**Use a Service Worker in the frontend app to intercept outgoing requests to `/_app/remote/[HASH]/call` and rewrite the hostname (and optionally port) to hit the backend server instead of itself.**

```typescript
// service-worker.ts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/_app/remote/')) return;

  // Rewrite to backend server
  url.host = dev ? 'localhost:5174' : 'api.yourdomain.com';
  url.protocol = productionSecure ? 'https:' : 'http:';

  const newRequest = new Request(url, event.request);
  event.respondWith(fetch(newRequest));
});
```

**This means:**

- The static app calls its own `/_app/remote/[HASH]/call` endpoint (which doesn't exist).
- Your service worker intercepts and rewrites that request to point at the backend server hostname instead.
- The backend server recognizes the hash, invokes the correct function, and returns the result!

## 📁 File Setup

### Frontend (`apps/frontend/src/lib/all.remote.ts`)

```typescript
// This is a "stub" that just re-exports from the backend
export * from '$backend/all.remote';
```

### Backend (`apps/backend/src/lib/all.remote.ts`)

```typescript
// This exports the actual implementations
export * from './server/api';
```

### Backend Implementation (`apps/backend/src/lib/server/api.ts`)

```typescript
import { query } from '$app/server';
import { z } from 'zod/v4';

export const toUpper = query(z.string(), async (input) => {
  console.log('backend: toUpper', input);
  return input.toUpperCase();
});
```

### Frontend Usage (`apps/frontend/src/routes/+page.svelte`)

```svelte
<script lang="ts">
    import { toUpper } from '$lib/all.remote';

    let message = $state('Hello, world!');
</script>

<button onclick={async () => { message = await toUpper(message); }}>
    Convert to UPPERCASE
</button>
```

## 🎭 The Magic in Action

1. **Build Time**: Both apps generate the same hash for `src/lib/all.remote.ts`
2. **Frontend Call**: `toUpper("hello")` → POST to `/_app/remote/ABC123/call`
3. **Service Worker**: Intercepts and redirects to `http://backend.example.com/_app/remote/ABC123/call`
4. **Backend**: Receives request, recognizes hash `ABC123`, executes `toUpper`, returns `"HELLO"`
5. **Frontend**: Receives response as if it was a local function call! ✨

## 🔧 Configuration

Update `apps/frontend/src/service-worker.ts`:

```typescript
// Switch this to your production domain
const productionHost = 'api.yourdomain.com';
// Switch this to true if your production domain has TLS
const productionSecure = true;
```

### Mobile App Considerations

For **Tauri/Capacitor** apps, you'll typically want:

- Set `productionHost` to your API server domain
- Ensure `productionSecure: true` for HTTPS in production
- Consider adding network error handling for offline scenarios
- Mobile apps can cache the static build but still call live backend functions!

## Summary: Why This Works

- **Same hash** = **same endpoint URL** (because you match file paths and thus hash inputs).
- **Service worker hostname rewrite** = bridges the frontend–backend network gap.
- **No need to publish code or have coupled deployments, just coordinate file layout and hash logic.**

## 🎉 Benefits

- ✅ **Elegant API**: Use SvelteKit's remote functions instead of manual fetch
- ✅ **Type Safety**: Full TypeScript support across frontend/backend
- ✅ **Separate Deployments**: Frontend and backend can be deployed independently
- ✅ **Static Frontend**: Deploy frontend to CDN/static hosting
- ✅ **Mobile-Ready**: Perfect for Tauri/Capacitor apps that need static builds
- ✅ **Flexible Backend**: Backend can be serverless, containers, or traditional servers

## 🛠️ Tech Stack

- **SvelteKit** with remote functions
- **TypeScript** for type safety
- **pnpm** for monorepo management
- **Zod** for request/response validation
- **Service Workers** for request interception

---

**References:**

- [SvelteKit Remote Functions Documentation](https://svelte.dev/docs/kit/remote-functions)
- [SvelteKit Service Workers Documentation](https://svelte.dev/docs/kit/service-workers)
- [SvelteKit Remote Functions Hashing](https://github.com/sveltejs/kit/blob/main/packages/kit/src/core/sync/create_manifest_data/index.js)
- [Hash function code](https://github.com/sveltejs/kit/blob/main/packages/kit/src/utils/hash.js)

Made with ❤️ by [Robin Braemer](https://github.com/robinbraemer)
