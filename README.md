# SvelteKit Static-to-Remote

> **Call SvelteKit remote functions from a static frontend to a separate backend deployment**

## ⚡ TLDR

**The Problem**: SvelteKit remote functions only work within the same deployment, but you want static frontend + separate backend.

**The Solution**: Service worker magic!

1. **Same file paths** in both apps → **same endpoint hashes**
2. **Service worker** intercepts `/_app/remote/[HASH]/call` → redirects to backend
3. **Backend CORS setup** handles cross-origin requests
4. **Result**: Seamless remote function calls across deployments! ✨

**Perfect for**: Static sites, mobile apps (Tauri/Capacitor), CDN deployments, serverless architectures.

---

## 🎯 Why You Need This

Normally, SvelteKit remote functions only work within the same deployment. But you want to:

- 🌐 Deploy frontend as static site (CDN, GitHub Pages)
- 📱 Build mobile apps (Tauri/Capacitor require static builds)
- 🖥️ Keep backend logic on separate servers
- ✨ Use elegant remote function API instead of manual fetch

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/robinbraemer/sveltekit-static-to-remote.git
cd sveltekit-static-to-remote && pnpm install

# Start backend (terminal 1)
cd apps/backend && pnpm dev  # http://localhost:5174

# Build and serve frontend (terminal 2)
cd apps/frontend && pnpm build && pnpx serve build  # http://localhost:3000
```

**Test**: Open http://localhost:3000 → try the form, buttons, text converter → functions execute on backend! ✨

## 🔧 How It Works

**The Secret**: SvelteKit generates remote function hashes based on **file paths**, not code.

1. **Same file paths** (`src/lib/all.remote.ts`) in both apps → **identical hashes**
2. **Service worker** ([`apps/frontend/src/service-worker.ts`](apps/frontend/src/service-worker.ts)) intercepts `/_app/remote/[HASH]/call`
3. **Redirects** to backend server with custom `X-SvelteKit-Remote` header
4. **Backend CORS** ([`apps/backend/src/hooks.server.ts`](apps/backend/src/hooks.server.ts)) allows cross-origin calls
5. **Backend** recognizes hash → executes function → returns result

**This means**: Static app calls non-existent endpoints → service worker intercepts → backend executes → seamless API! 🎯

**Note**: Query, form, and command functions work perfectly. Prerender functions work but currently bypass caching (call backend at runtime instead of using build-time cached data). See known limitations below.

## 📂 Implementation

**Core Files:**

- **Frontend**: [`service-worker.ts`](apps/frontend/src/service-worker.ts) - Intercepts and forwards remote calls
- **Backend**: [`hooks.server.ts`](apps/backend/src/hooks.server.ts) - Handles CORS for cross-origin requests
- **Functions**: [`api.ts`](apps/backend/src/lib/server/api.ts) - Remote function implementations (query, form, command, prerender)

**Key Pattern**: Use **identical file paths** (`src/lib/all.remote.ts`) in both apps to ensure matching hashes.

### ⚠️ Known Limitation: Prerender Functions

**Issue**: Prerender functions are called at backend build time (✅) but also at runtime when serving the static app (❌), instead of using cached build-time data.

**Root Cause**: Service worker intercepts SvelteKit's Cache API lookups, preventing proper prerender caching behavior.

**Current Status**: Prerender functions work but don't get the performance benefits of true prerendering.

**Solution Needed**: Service worker should integrate properly with SvelteKit's Cache API to respect prerendered data.

**🚀 PRs Welcome!** If you can fix the Cache API integration to make prerender functions truly cached, please contribute!

**This means:**

- Static app calls its own `/_app/remote/[HASH]/call` endpoint (which doesn't exist)
- Service worker intercepts and redirects to backend server
- Backend recognizes the hash and executes the function
- Result feels like a local function call! ✨

## 🔧 Quick Troubleshooting

- **Service worker not working?** DevTools → Application → Service Workers → Update + reload
- **CORS errors?** Add your frontend origin to `ALLOWED_ORIGINS` in backend hook
- **JSON parsing errors?** Backend hook handles OPTIONS preflight (already included)
- **Prerender called at runtime?** Known limitation - Cache API integration needs improvement (see above)

## 🔧 Configuration

**Frontend Service Worker** ([`service-worker.ts`](apps/frontend/src/service-worker.ts)):

```typescript
const productionHost = 'api.yourdomain.com'; // Your backend domain
const productionSecure = true; // true for HTTPS
```

**Backend CORS** ([`hooks.server.ts`](apps/backend/src/hooks.server.ts)):

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // frontend dev
  'http://localhost:3000', // frontend serve
  'https://yourdomain.com', // production frontend
  'capacitor://localhost', // Capacitor iOS
  'http://localhost', // Capacitor Android
  'tauri://localhost', // Tauri
];
```

### Cross-Origin Solution: Service Worker + CORS

Since the static frontend deploys to a different host/origin than the backend, but both generate the same hash in their remotes, you need two components:

#### 1. **Service Worker: Request Forwarding**

The service worker intercepts remote function calls and forwards them to the backend.

**📁 Implementation:** [`apps/frontend/src/service-worker.ts`](apps/frontend/src/service-worker.ts)

Key features:

- **Intercepts** `/_app/remote/...` requests
- **Adds custom header** `X-SvelteKit-Remote: true` for remote function detection (CORS)
- **Handles request bodies** properly (buffered as Blob to avoid stream issues)
- **Preserves cookies and metadata** with `credentials: 'include'`
- **Redirects to backend** by changing host/protocol only

#### 2. **Backend: CORS Handling**

The backend needs CORS headers to allow cross-origin requests from the static frontend.

**📁 Implementation:** [`apps/backend/src/hooks.server.ts`](apps/backend/src/hooks.server.ts)

Key features:

- **Custom header detection** using `X-SvelteKit-Remote`
- **OPTIONS preflight handling** (bypasses service worker, needs backend support)
- **Origin validation** against whitelist for security
- **Credentialed CORS** to forward cookies and authentication

**This means:**

- The static app calls its own `/_app/remote/[HASH]/call` endpoint (which doesn't exist).
- Your service worker intercepts and rewrites that request to point at the backend server hostname instead.
- The backend server recognizes the hash, invokes the correct function, and returns the result!

**Key Implementation Details:**

- **Custom Header Detection**: Service worker adds `X-SvelteKit-Remote` header for reliable remote call detection
- **CORS Preflight**: OPTIONS requests are handled separately since they bypass service worker
- **Body Streaming**: Request body is buffered as Blob to avoid ReadableStream consumption issues
- **Origin Validation**: Backend validates against whitelist for security
- **Progressive Enhancement**: All remote function types maintain their built-in behaviors

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

### Frontend Service Worker

Update `apps/frontend/src/service-worker.ts`:

```typescript
const productionHost = 'api.yourdomain.com'; // Your backend domain
const productionSecure = true; // true for HTTPS
```

### Backend CORS Setup

Create `apps/backend/src/hooks.server.ts` with your frontend origins:

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // frontend dev
  'http://localhost:3000', // frontend serve
  'https://yourdomain.com', // production frontend
  'capacitor://localhost', // Capacitor iOS
  'http://localhost', // Capacitor Android
  'tauri://localhost', // Tauri
];
```

### Mobile App Considerations

For **Tauri/Capacitor** apps:

- **Add mobile origins** to `ALLOWED_ORIGINS` (see above)
- **Set `productionHost`** to your API server domain
- **Use HTTPS** in production (`productionSecure: true`)
- **Handle offline scenarios** with service worker caching
- **Mobile apps cache static build** but call live backend functions

### Production Deployment

1. **Frontend**: Deploy `build/` folder to static hosting
2. **Backend**: Deploy with your backend origins in CORS config
3. **Update service worker** with production backend URL

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
- ⚠️ **Prerender Functions**: Work but need Cache API integration improvements for true performance benefits

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
