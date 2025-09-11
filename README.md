# 🚀 SvelteKit Static-to-Remote

<div align="center">

**Call SvelteKit remote functions from a static frontend to a separate backend deployment**

[![Demo](https://img.shields.io/badge/🎯-Live%20Demo-blue)](https://github.com/robinbraemer/sveltekit-static-to-remote)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/docs/kit/remote-functions)
[![Mobile](https://img.shields.io/badge/📱-Mobile%20Ready-green)](#mobile-apps)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#tech-stack)

</div>


https://github.com/user-attachments/assets/dae1146a-9391-4ab9-911e-b951b2fe7942

In this demo, the static frontend example is deployed on Surge CDN, while the backend is running locally and exposed through a Cloudflare tunnel. You can see that the remote functions are calling the backend URL instead of the frontend URL.

---

## ⚡ TLDR

**🎯 Problem**: SvelteKit remote functions only work within the same deployment, but you want static frontend + separate backend.

**💡 Solution**: Service worker magic!

1. **Same file paths** in both apps → **identical endpoint hashes**
2. **Service worker** intercepts `/_app/remote/[HASH]/call` → redirects to backend
3. **Backend CORS** handles cross-origin requests securely
4. **Result**: Seamless remote function calls across deployments! ✨

**Perfect for**: Static sites • Mobile apps (Tauri/Capacitor) • CDN deployments • Serverless architectures

<div align="center">
<img width="602" height="431" alt="image" src="https://github.com/user-attachments/assets/5f1e545f-453f-4c5b-a2e8-8f54dd4a49cb" />
</div>

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

> **Note**: Query, form, and command functions work perfectly. **Prerender functions currently fail cross-origin** due to service worker unable to reach backend during static serving.

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
- **Status**: ❌ **Currently unsupported cross-origin** (service worker cannot reach backend during static serving)

---

## ⚠️ Known Limitation: Prerender Cross-Origin

**What Works**: ✅ Prerender functions ARE called during backend build time  
**What Fails**: ❌ Static app attempts runtime calls to backend but service worker cannot establish connection

**Root Cause**: Prerender functions bypass static cache and attempt cross-origin calls at runtime. Service worker intercepts but cannot reach backend server during static serving.

**🚀 PRs Welcome!** Help implement proper prerender cache serving or fix cross-origin prerender calls!

---

## 🌐 Production Testing (No Signup Required)

<details>
<summary><strong>🚀 Test cross-origin functionality without signup using Surge.sh + Cloudflare Tunnel</strong></summary>

### **📦 Prerequisites**

```bash
# Install tools (no accounts needed)
pnpm install -g surge
# Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
```

### **🎯 Quick Deployment Test**

<details>
<summary><strong>Step 1: Configure Backend for Production</strong></summary>

```bash
# 1. Add your test domain to CORS
# Edit: apps/backend/src/hooks.server.ts
const ALLOWED_ORIGINS = [
  // ... existing origins
  'https://your-test-domain.surge.sh', // Add your chosen domain
];

# 2. Allow Cloudflare tunnel domains
# Edit: apps/backend/vite.config.js
export default {
  server: {
    allowedHosts: [
      '.trycloudflare.com', // Allow any trycloudflare subdomain
    ]
  }
};
```

**💡 Enables curl testing**: `curl -i https://xxx.trycloudflare.com/_app/version.json`

</details>

<details>
<summary><strong>Step 2: Start Backend + Tunnel</strong></summary>

```bash
# Terminal 1: Backend with public tunnel
cd apps/backend
pnpm build && node build/index.js &
cloudflared tunnel --url http://localhost:5174

# 📋 Copy the https://xxx.trycloudflare.com URL (appears in terminal)
```

</details>

<details>
<summary><strong>Step 3: Deploy Frontend</strong></summary>

```bash
# Terminal 2: Configure & deploy frontend
cd apps/frontend
echo 'PUBLIC_BACKEND_HOST="xxx.trycloudflare.com"' > .env
echo 'PUBLIC_BACKEND_INSECURE="false"' >> .env

pnpm build
surge ./build
# 🌐 Choose domain: your-test-domain.surge.sh
```

</details>

### **🧪 Expected Results**

- **✅ Query/Form/Command**: Cross-origin requests working
- **❌ Prerender**: CORS failures (documented limitation)
- **✅ Service Worker**: Console logs show interception

### **🔧 Quick Validation with Curl**

```bash
# Test OPTIONS preflight (should return 204 with CORS headers)
curl -i -H "Origin: https://your-test.surge.sh" \
  -X OPTIONS \
  https://xxx.trycloudflare.com/_app/remote/13eoo5e/toUpper

# Test backend health (should return 200 OK)
curl -i https://xxx.trycloudflare.com/_app/version.json
```

**🎯 This validates real production cross-origin scenarios without browser testing!**

</details>

---

## 🧪 Testing

**Comprehensive test suite with automated validation:**

```bash
# Run all tests
pnpm test:all  # Builds + API tests + E2E tests

# Individual test suites
pnpm test     # API tests (Vitest)
pnpm e2e      # Browser tests (Playwright)
```

### 📊 **Test Coverage:**

- **✅ API Tests** (`apps/tests/src/api/`):

  - CORS validation for all remote function types
  - Cross-origin request/response verification
  - Backend server integration testing

- **✅ E2E Tests** (`apps/tests/src/e2e/`):

  - **3 browsers tested**: Chrome, Firefox, Safari
  - Service worker functionality validation
  - Complete user interaction flows
  - Network request tracking and analysis

- **✅ Infrastructure Tests**:
  - Automated build and serve setup
  - Robust timeout and cleanup handling
  - Process management (no hanging tests)

### 🎯 **Test Results:**

- **API Tests**: 3/4 pass (prerender limitation documented)
- **E2E Tests**: 3/3 browsers pass
- **Service Worker**: ✅ Intercepts all remote calls correctly
- **Cross-Origin**: ✅ Query/Form/Command work perfectly

**🔬 Scientific Validation**: E2E tests discovered and corrected false assumptions about prerender caching behavior.

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
- **JSON parsing errors?** Fixed with improved service worker error handling
- **Prerender fails to load?** Expected - currently unsupported cross-origin (use query functions instead)

---

## 🎉 Benefits

- ✅ **Elegant API**: Use SvelteKit's remote functions instead of manual fetch
- ✅ **Type Safety**: Full TypeScript support across frontend/backend
- ✅ **Separate Deployments**: Frontend and backend deploy independently
- ✅ **Static Hosting**: CDN/GitHub Pages compatible
- ✅ **Mobile Ready**: Perfect for Tauri/Capacitor apps
- ❌ **Prerender Functions**: Currently unsupported cross-origin (3 out of 4 function types work)

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
