# 🚀 SvelteKit Static-to-Remote

<div align="center">

**Call SvelteKit remote functions from a static frontend to a separate backend deployment**

[![Demo](https://img.shields.io/badge/🎯-Live%20Demo-blue)](https://github.com/robinbraemer/sveltekit-static-to-remote)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/docs/kit/remote-functions)
[![Mobile](https://img.shields.io/badge/📱-Mobile%20Ready-green)](#mobile-apps)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#tech-stack)

</div>

---

## ⚡ TLDR

**🎯 Problem**: SvelteKit remote functions only work within the same deployment, but you want static frontend + separate backend.

**💡 Solution**: Service worker magic!

1. **Same file paths** in both apps → **identical endpoint hashes**
2. **Service worker** intercepts `/_app/remote/[HASH]/call` → redirects to backend
3. **Backend CORS** handles cross-origin requests securely
4. **Result**: Seamless remote function calls across deployments! ✨

**Perfect for**: Static sites • Mobile apps (Tauri/Capacitor) • CDN deployments • Serverless architectures

---

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

**🧪 Test**: Open <http://localhost:3000> → try the form, buttons, text converter → functions execute on backend!

---

## 🔧 How It Works

**The Secret**: SvelteKit generates remote function hashes based on **file paths**, not code.

1. **Same file paths** (`src/lib/all.remote.ts`) in both apps → **identical hashes**
2. **Service worker** ([`service-worker.ts`](apps/frontend/src/service-worker.ts)) intercepts `/_app/remote/[HASH]/call`
3. **Redirects** to backend server with custom `X-SvelteKit-Remote` header
4. **Backend CORS** ([`hooks.server.ts`](apps/backend/src/hooks.server.ts)) allows cross-origin calls
5. **Backend** recognizes hash → executes function → returns result

**This means**: Static app calls non-existent endpoints → service worker intercepts → backend executes → seamless API!

> **Note**: Query, form, and command functions work perfectly. Prerender functions work but currently bypass caching (call backend at runtime instead of using build-time cached data).

---

## 📂 Implementation

**Core Files:**

- 🔀 **Service Worker**: [`service-worker.ts`](apps/frontend/src/service-worker.ts) - Intercepts and forwards remote calls
- 🌐 **CORS Handler**: [`hooks.server.ts`](apps/backend/src/hooks.server.ts) - Handles cross-origin requests securely
- ⚡ **Remote Functions**: [`api.ts`](apps/backend/src/lib/server/api.ts) - Query, form, command, prerender implementations

**Key Pattern**: Use **identical file paths** (`src/lib/all.remote.ts`) in both apps to ensure matching hashes.

> **📝 Note on Remote File Structure**: We use a single `all.remote.ts` file to re-export all remote functions for simplicity. You _could_ have multiple remote files like `lib/users.remote.ts`, `lib/orders.remote.ts`, etc., but you'd need to ensure each file exists at the **exact same path** in both apps (since the hash is based on file path). Using a single `all.remote.ts` file simplifies maintenance and reduces the chance of path mismatches between frontend and backend.

---

## 🎯 Demo: All 4 Remote Function Types

### 🔍 **Query** - Dynamic Data

- **Purpose**: Real-time backend data fetching
- **Example**: Text converter with instant transformation
- **Features**: Type-safe responses, reactive loading states

### 📝 **Form** - Progressive Enhancement

- **Purpose**: Type-safe form submissions
- **Example**: Contact form with validation
- **Features**: Works without JS, built-in reactive states (`.pending`, `.result`)

### ⚡ **Command** - Fire & Forget

- **Purpose**: Server actions without return data
- **Example**: Activity logging, analytics tracking
- **Features**: Instant feedback, no response data

### 📊 **Prerender** - Build-time Static

- **Purpose**: Static data generated at build time
- **Example**: App info, stats, configuration
- **Status**: ⚠️ **Known limitation**: CORS not supported for prerendered responses (served from cache, bypasses hooks)

---

## ⚠️ Known Limitation: Prerender Caching

**What Works**: ✅ Prerender functions ARE called during backend build time  
**What's Missing**: ❌ Static app calls backend instead of using cached build-time data

**Root Cause**: Service worker intercepts SvelteKit's Cache API lookups, preventing proper prerender caching behavior.

**🚀 PRs Welcome!** Help improve Cache API integration for true prerender performance benefits.

---

## 🔧 Configuration

### Frontend Service Worker

**File**: [`apps/frontend/src/service-worker.ts`](apps/frontend/src/service-worker.ts)

```typescript
const productionHost = 'api.yourdomain.com'; // Your backend domain
const productionSecure = true; // true for HTTPS
```

### Backend CORS Setup

**File**: [`apps/backend/src/hooks.server.ts`](apps/backend/src/hooks.server.ts)

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // frontend dev
  'http://localhost:3000', // frontend serve
  'https://yourdomain.com', // production frontend
  'capacitor://localhost', // Capacitor iOS
  'http://localhost', // Capacitor Android
  'tauri://localhost', // Tauri desktop
];
```

### Mobile Apps (Tauri/Capacitor)

**Additional setup for mobile apps:**

- Add mobile origins to `ALLOWED_ORIGINS` (see above)
- Set `productionHost` to your API server domain
- Use HTTPS in production (`productionSecure: true`)
- Mobile apps cache static build but call live backend functions

---

## 🚀 Deployment

**📦 Frontend (Static)**

- Vercel, Netlify, GitHub Pages → Deploy `build/` folder
- Any CDN or static hosting service
- Mobile frameworks: Tauri (desktop), Capacitor (iOS/Android), Electron

**🖥️ Backend (Server)**

- Railway, Fly.io, VPS → Deploy with Node.js
- Vercel Functions, Netlify Functions → Deploy as serverless
- Any container or traditional server

**📱 Mobile Advantage**: Tauri and Capacitor require static builds since they bundle your web app into native containers. This technique lets you keep heavy backend logic on servers while maintaining elegant remote function APIs!

---

## 🛠️ Troubleshooting

- **Service worker not working?** DevTools → Application → Service Workers → Update + reload
- **CORS errors?** Add your frontend origin to `ALLOWED_ORIGINS` in backend hook
- **JSON parsing errors?** Backend hook handles OPTIONS preflight (already included)
- **Prerender called at runtime?** Known limitation - Cache API integration needs improvement

---

## 🎉 Benefits

- ✅ **Elegant API**: Use SvelteKit's remote functions instead of manual fetch
- ✅ **Type Safety**: Full TypeScript support across frontend/backend
- ✅ **Separate Deployments**: Frontend and backend deploy independently
- ✅ **Static Hosting**: CDN/GitHub Pages compatible
- ✅ **Mobile Ready**: Perfect for Tauri/Capacitor apps
- ⚠️ **Prerender Functions**: Work but need Cache API integration improvements

---

## 📚 Technical Deep Dive

**The Hash Secret**: SvelteKit generates endpoint hashes based on **file paths**, not code content.

```javascript
// SvelteKit source (simplified):
remotes.push({
  hash: hash(filePath), // Hash of file path
  file: filePath, // e.g., "src/lib/all.remote.ts"
});
```

**Why This Works**:

- Both apps use `src/lib/all.remote.ts` → same hash → same endpoint
- Frontend calls `/_app/remote/13eoo5e/call` (doesn't exist locally)
- Service worker intercepts → forwards to `backend.com/_app/remote/13eoo5e/call`
- Backend recognizes hash `13eoo5e` → executes function → returns result

**Service Worker Flow**:

1. Clone original request to preserve body streams
2. Add `X-SvelteKit-Remote` header for backend detection
3. Forward with preserved cookies, referrer, and metadata
4. Handle POST body buffering to avoid stream consumption issues

---

## 🛠️ Tech Stack

- **SvelteKit** - Remote functions framework
- **TypeScript** - Type safety across deployments
- **Service Workers** - Request interception and forwarding
- **Zod** - Request/response validation
- **PNPM** - Efficient monorepo management

---

## 📖 References

- [SvelteKit Remote Functions](https://svelte.dev/docs/kit/remote-functions)
- [Service Workers Documentation](https://svelte.dev/docs/kit/service-workers)
- [Remote Functions Hashing Source](https://github.com/sveltejs/kit/blob/main/packages/kit/src/core/sync/create_manifest_data/index.js)
- [Hash Function Implementation](https://github.com/sveltejs/kit/blob/main/packages/kit/src/utils/hash.js)

---

<div align="center">

**Made with ❤️ by [Robin Braemer](https://github.com/robinbraemer)**

_Building bridges between static frontends and dynamic backends_

[⭐ Star](https://github.com/robinbraemer/sveltekit-static-to-remote) • [🍴 Fork](https://github.com/robinbraemer/sveltekit-static-to-remote/fork) • [💬 Discuss](https://github.com/robinbraemer/sveltekit-static-to-remote/discussions)

</div>
