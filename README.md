# 🚀 SvelteKit Static-to-Remote

<div align="center">
  <h3>Call SvelteKit remote functions from a static frontend to a separate backend deployment</h3>
  
  [![Demo](https://img.shields.io/badge/🎯-Live%20Demo-blue)](https://github.com/robinbraemer/sveltekit-static-to-remote)
  [![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/docs/kit/remote-functions)
  [![Mobile](https://img.shields.io/badge/📱-Mobile%20Ready-green)](#mobile-apps)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#tech-stack)
</div>

---

## ⚡ **TLDR**

<table>
<tr>
<td><strong>🎯 Problem</strong></td>
<td>SvelteKit remote functions only work within the same deployment</td>
</tr>
<tr>
<td><strong>💡 Solution</strong></td>
<td>Service worker magic + CORS = seamless cross-deployment calls</td>
</tr>
<tr>
<td><strong>🎯 Perfect For</strong></td>
<td>Static sites • Mobile apps (Tauri/Capacitor) • CDN deployments • Serverless</td>
</tr>
</table>

### **How It Works:**

1. 📁 **Same file paths** in both apps → **identical endpoint hashes**
2. 🔀 **Service worker** intercepts `/_app/remote/[HASH]/call` → redirects to backend
3. 🌐 **Backend CORS** handles cross-origin requests securely
4. ✨ **Result**: Seamless remote function calls across deployments!

---

## 🚀 **Quick Start**

```bash
# 📥 Clone and install
git clone https://github.com/robinbraemer/sveltekit-static-to-remote.git
cd sveltekit-static-to-remote && pnpm install

# 🖥️ Start backend (terminal 1)
cd apps/backend && pnpm dev  # http://localhost:5174

# 🌐 Build and serve frontend (terminal 2)
cd apps/frontend && pnpm build && pnpx serve build  # http://localhost:3000
```

**🧪 Test**: Open http://localhost:3000 → try the form, buttons, text converter → functions execute on backend!

---

## 🏗️ **Architecture**

<table>
<tr>
<th width="33%">📁 Frontend (Static)</th>
<th width="33%">🔀 Service Worker</th>
<th width="33%">🖥️ Backend (Server)</th>
</tr>
<tr>
<td>

**Static Build**

- `adapter-static`
- Calls `/_app/remote/[HASH]/*`
- Deployable to CDN
- Mobile app ready

</td>
<td>

**Request Interception**

- Intercepts remote calls
- Forwards to backend
- Handles CORS headers
- Preserves cookies

</td>
<td>

**Function Execution**

- Recognizes hashes
- Executes functions
- Returns results
- Handles validation

</td>
</tr>
</table>

### 🔧 **Core Implementation Files**

| Component               | File                                                       | Purpose                                         |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| 🔀 **Service Worker**   | [`service-worker.ts`](apps/frontend/src/service-worker.ts) | Intercepts and forwards remote calls            |
| 🌐 **CORS Handler**     | [`hooks.server.ts`](apps/backend/src/hooks.server.ts)      | Handles cross-origin requests securely          |
| ⚡ **Remote Functions** | [`api.ts`](apps/backend/src/lib/server/api.ts)             | Query, form, command, prerender implementations |

> **📝 Note on Remote File Structure**: We use a single `all.remote.ts` file to re-export all remote functions for simplicity. You _could_ have multiple remote files like `lib/users.remote.ts`, `lib/orders.remote.ts`, etc., but you'd need to ensure each file exists at the **exact same path** in both apps (since the hash is based on file path). Using a single `all.remote.ts` file simplifies maintenance and reduces the chance of path mismatches between frontend and backend.

---

## 🎯 **Remote Function Types Demo**

Our demo showcases all four SvelteKit remote function types:

<table>
<tr>
<th width="25%">🔍 Query</th>
<th width="25%">📝 Form</th>  
<th width="25%">⚡ Command</th>
<th width="25%">📊 Prerender</th>
</tr>
<tr>
<td>

**Dynamic Data**

- Text converter
- Real-time backend calls
- Type-safe responses
- Reactive loading states

</td>
<td>

**Progressive Enhancement**

- Contact form
- Works without JS
- Built-in validation
- Success/error feedback

</td>
<td>

**Fire & Forget**

- Activity logging
- No return data
- Analytics tracking
- Instant feedback

</td>
<td>

**Build-time Static**

- App info/stats
- Generated at build
- CDN cacheable
- ⚠️ _[Caching needs fix]_

</td>
</tr>
</table>

---

## ⚠️ **Known Limitation: Prerender Caching**

| Status                 | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| ✅ **Build Time**      | Prerender functions ARE called during backend build        |
| ✅ **Functionality**   | Functions work and return correct data                     |
| ❌ **Runtime Caching** | Static app calls backend instead of using cached data      |
| 🔧 **Needs Fix**       | Service worker should integrate with SvelteKit's Cache API |

**🚀 PRs Welcome!** Help improve Cache API integration for true prerender performance benefits.

---

## 🔧 **Configuration**

<details>
<summary><strong>🌐 Frontend Service Worker</strong></summary>

**File**: [`apps/frontend/src/service-worker.ts`](apps/frontend/src/service-worker.ts)

```typescript
// Switch this to your production domain
const productionHost = 'api.yourdomain.com';
const productionSecure = true; // true for HTTPS
```

</details>

<details>
<summary><strong>🛡️ Backend CORS Setup</strong></summary>

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

</details>

<details>
<summary><strong>📱 Mobile Apps (Tauri/Capacitor)</strong></summary>

**Additional Setup:**

- Add mobile origins to `ALLOWED_ORIGINS` (see above)
- Set `productionHost` to your API server domain
- Use HTTPS in production (`productionSecure: true`)
- Mobile apps cache static build but call live backend functions

</details>

---

## 🚀 **Deployment Examples**

<table>
<tr>
<th>🌐 Static Frontend</th>
<th>🖥️ Backend Server</th>
</tr>
<tr>
<td>

**CDN/Static Hosting:**

- Vercel (`build/` folder)
- Netlify (same)
- GitHub Pages (same)
- Any CDN

**Mobile Apps:**

- Tauri (Rust + Web)
- Capacitor (iOS/Android)
- Electron (Desktop)

</td>
<td>

**Traditional Servers:**

- Railway (Node.js)
- Fly.io (Docker)
- Any VPS

**Serverless:**

- Vercel Functions
- Netlify Functions
- AWS Lambda

</td>
</tr>
</table>

---

## 🛠️ **Troubleshooting**

<table>
<tr>
<th>❌ Issue</th>
<th>🔧 Solution</th>
</tr>
<tr>
<td>Service worker not working</td>
<td>DevTools → Application → Service Workers → Update + reload</td>
</tr>
<tr>
<td>CORS policy errors</td>
<td>Add your frontend origin to <code>ALLOWED_ORIGINS</code></td>
</tr>
<tr>
<td>JSON parsing errors</td>
<td>Backend hook handles OPTIONS (already included)</td>
</tr>
<tr>
<td>Prerender called at runtime</td>
<td>Known limitation - Cache API integration needs improvement</td>
</tr>
</table>

---

## 🎉 **Benefits**

<div align="center">

| ✅ **What Works Perfectly**                             | ⚠️ **Known Limitations**                            |
| :------------------------------------------------------ | :-------------------------------------------------- |
| **Query Functions** - Real-time data fetching           | **Prerender Caching** - Needs Cache API integration |
| **Form Functions** - Progressive enhancement            |                                                     |
| **Command Functions** - Fire & forget actions           |                                                     |
| **Type Safety** - Full TypeScript support               |                                                     |
| **Separate Deployments** - Independent frontend/backend |                                                     |
| **Mobile Ready** - Perfect for Tauri/Capacitor          |                                                     |
| **Static Hosting** - CDN/GitHub Pages compatible        |                                                     |

</div>

---

## 📚 **Technical Details**

<details>
<summary><strong>🧠 How the Hash System Works</strong></summary>

**The Secret**: SvelteKit generates endpoint hashes based on **file paths**, not code content.

**SvelteKit Source References:**

- [Hash function](https://github.com/sveltejs/kit/blob/main/packages/kit/src/utils/hash.js)
- [Manifest generation](https://github.com/sveltejs/kit/blob/main/packages/kit/src/core/sync/create_manifest_data/index.js)

**Why This Works:**

```js
// Both apps have: src/lib/all.remote.ts
// SvelteKit generates: hash('src/lib/all.remote.ts') = 'ABC123'
// Frontend calls: /_app/remote/ABC123/call
// Backend serves: /_app/remote/ABC123/call
// Service worker: localhost:5173 → localhost:5174 (same path!)
```

</details>

---

## 🛠️ **Tech Stack**

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Service Workers](https://img.shields.io/badge/Service%20Workers-000000?style=for-the-badge&logo=pwa&logoColor=white)
![PNPM](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

</div>

- **SvelteKit** - Remote functions framework
- **TypeScript** - Type safety across deployments
- **Service Workers** - Request interception and forwarding
- **Zod** - Request/response validation
- **PNPM** - Efficient monorepo management

---

## 📖 **References**

- [📚 SvelteKit Remote Functions](https://svelte.dev/docs/kit/remote-functions)
- [🔧 SvelteKit Service Workers](https://svelte.dev/docs/kit/service-workers)
- [⚙️ Remote Functions Hashing Source](https://github.com/sveltejs/kit/blob/main/packages/kit/src/core/sync/create_manifest_data/index.js)
- [🧮 Hash Function Source](https://github.com/sveltejs/kit/blob/main/packages/kit/src/utils/hash.js)

---

<div align="center">

**Made with ❤️ by [Robin Braemer](https://github.com/robinbraemer)**

_Building bridges between static frontends and dynamic backends_

[⭐ Star this repo](https://github.com/robinbraemer/sveltekit-static-to-remote) • [🍴 Fork it](https://github.com/robinbraemer/sveltekit-static-to-remote/fork) • [💬 Discuss](https://github.com/robinbraemer/sveltekit-static-to-remote/discussions)

</div>
