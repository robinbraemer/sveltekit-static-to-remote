import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = fileURLToPath(new URL('../../../../', import.meta.url));

function run(cmd: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: 'inherit' });
    p.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))
    );
  });
}

async function waitOk(url: string, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await delay(200);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

let backendProc: import('node:child_process').ChildProcess | undefined;
let frontendProc: import('node:child_process').ChildProcess | undefined;

export default async function setup() {
  const BUILD_TIMEOUT_MS = Number(process.env.BUILD_TIMEOUT_MS ?? 120_000);
  const START_TIMEOUT_MS = Number(process.env.START_TIMEOUT_MS ?? 20_000);
  const GLOBAL_TIMEOUT_MS = Number(
    process.env.GLOBAL_TEST_TIMEOUT_MS ?? 10 * 60_000
  );

  // Global guard to avoid stuck runs
  const globalTimer = setTimeout(() => {
    console.error('[tests] Global timeout exceeded, terminating...');
    backendProc?.kill('SIGTERM');
    frontendProc?.kill('SIGTERM');
    process.exit(1);
  }, GLOBAL_TIMEOUT_MS);

  function runWithTimeout(
    cmd: string,
    args: string[],
    cwd: string,
    timeoutMs: number
  ) {
    return new Promise<void>((resolve, reject) => {
      const p = spawn(cmd, args, { cwd, stdio: 'inherit' });
      const timer = setTimeout(() => {
        console.error(`[timeout] ${cmd} ${args.join(' ')} in ${cwd}`);
        p.kill('SIGTERM');
        reject(new Error(`Timeout: ${cmd} ${args.join(' ')}`));
      }, timeoutMs);
      p.on('exit', (code) => {
        clearTimeout(timer);
        code === 0
          ? resolve()
          : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
      });
    });
  }

  // Build once
  const backendDir = `${root}apps/backend`;
  await runWithTimeout('pnpm', ['build'], backendDir, BUILD_TIMEOUT_MS);
  backendProc = spawn('node', ['build/index.js'], {
    cwd: backendDir,
    env: { ...process.env, PORT: '5174' },
    stdio: 'inherit',
  });
  await waitOk('http://localhost:5174/_app/version.json', START_TIMEOUT_MS);

  const frontendDir = `${root}apps/frontend`;
  await runWithTimeout('pnpm', ['build'], frontendDir, BUILD_TIMEOUT_MS);
  frontendProc = spawn('pnpm', ['dlx', 'serve', 'build', '-l', '3010'], {
    cwd: frontendDir,
    stdio: 'inherit',
  });
  await waitOk('http://localhost:3010', START_TIMEOUT_MS);

  process.env.BACKEND_URL = 'http://localhost:5174';
  process.env.FRONTEND_URL = 'http://localhost:3010';

  const teardown = async () => {
    console.log('[teardown] Cleaning up processes...');
    clearTimeout(globalTimer);
    const procs = [backendProc, frontendProc];

    for (const p of procs) {
      if (!p || p.killed) continue;
      try {
        console.log(`[teardown] Killing PID ${p.pid}`);
        p.kill('SIGTERM');
        // Wait a bit, then force kill if needed
        await delay(2000);
        if (!p.killed) {
          console.log(`[teardown] Force killing PID ${p.pid}`);
          p.kill('SIGKILL');
        }
      } catch (err) {
        console.log(`[teardown] Error killing process: ${err}`);
      }
    }

    // Kill any remaining processes on our ports
    try {
      spawn('pkill', ['-f', 'PORT=5174'], { stdio: 'ignore' });
      spawn('pkill', ['-f', 'serve.*3010'], { stdio: 'ignore' });
    } catch {}

    console.log('[teardown] Cleanup complete');
  };

  // Ensure teardown on common signals
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  for (const sig of signals) {
    process.once(sig, async () => {
      console.log(`[teardown] Received ${sig}, cleaning up...`);
      await teardown();
      process.exit(0);
    });
  }

  process.once('uncaughtException', async (err) => {
    console.log('[teardown] Uncaught exception:', err);
    await teardown();
    process.exit(1);
  });

  process.once('unhandledRejection', async (reason) => {
    console.log('[teardown] Unhandled rejection:', reason);
    await teardown();
    process.exit(1);
  });

  return teardown;
}
