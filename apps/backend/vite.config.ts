import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5174,
		// You could use `cloudflared tunnel --url http://localhost:5174`
		// and add your temporary trycloudflare domain here and in
		// the PUBLIC_BACKEND_HOST in the frontend .env
		// and re-build the frontend and deploy it by running
		// `surge ./build` and update the
		// hooks.server.ts to allow the surge domain.
		allowedHosts: ['grew-def-checks-license.trycloudflare.com']
	}
});
