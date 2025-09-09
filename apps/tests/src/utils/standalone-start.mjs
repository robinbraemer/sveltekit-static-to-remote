import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../../../../', import.meta.url));

/**
 * Spawn a process and wait until a URL responds with 200.
 */
async function start(name, cmd, args, opts, url, timeoutMs = 15000) {
  console.log(`[start] ${name}: ${cmd} ${args.join(' ')}`);
  const child = spawn(cmd, args, {
    cwd: opts.cwd,
    stdio: 'inherit',
    env: { ...process.env, ...opts.env },
  });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        console.log(`[ready] ${name} at ${url}`);
        return child;
      }
    } catch {}
    await delay(250);
  }
  child.kill('SIGTERM');
  throw new Error(`Timeout waiting for ${name} at ${url}`);
}

async function main() {
  // Build backend and start node server
  const backendDir = `${root}apps/backend`;
  await start(
    'backend-build',
    'pnpm',
    ['build'],
    { cwd: backendDir },
    'http://localhost:5174/_app/version.json'
  ).catch(() => {});
  const backend = await start(
    'backend',
    'node',
    ['build/index.js'],
    { cwd: backendDir, env: { PORT: '5174' } },
    'http://localhost:5174/_app/version.json'
  );

  // Build frontend and serve static
  const frontendDir = `${root}apps/frontend`;
  await start(
    'frontend-build',
    'pnpm',
    ['build'],
    { cwd: frontendDir },
    'http://127.0.0.1:65535/version.json'
  ).catch(() => {});
  const serve = await start(
    'frontend',
    'pnpm',
    ['dlx', 'serve', 'build', '-l', '3000'],
    { cwd: frontendDir },
    'http://localhost:3000'
  );

  process.on('SIGINT', () => {
    backend.kill('SIGTERM');
    serve.kill('SIGTERM');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
