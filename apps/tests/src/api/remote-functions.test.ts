import { afterAll, beforeAll, describe, expect, it } from 'vitest';
describe('Remote functions CORS', () => {
  beforeAll(async () => {}, 120_000);

  it('query (GET) should work cross-origin with SW', async () => {
    const res = await fetch(
      `${process.env.BACKEND_URL}/_app/remote/13eoo5e/toUpper`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SvelteKit-Remote': 'true',
          Origin: process.env.FRONTEND_URL!,
        },
        body: JSON.stringify({ payload: 'hello' }),
      }
    );
    expect(res.status).toBe(200);
  });

  it('form (POST) should allow preflight and respond with ACAO', async () => {
    const res = await fetch(
      `${process.env.BACKEND_URL}/_app/remote/13eoo5e/createMessage`,
      {
        method: 'OPTIONS',
        headers: {
          Origin: process.env.FRONTEND_URL!,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,x-sveltekit-remote',
        },
      }
    );
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(
      process.env.FRONTEND_URL
    );
  });

  it('command (POST) should work cross-origin', async () => {
    const res = await fetch(
      `${process.env.BACKEND_URL}/_app/remote/13eoo5e/logActivity`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SvelteKit-Remote': 'true',
          Origin: process.env.FRONTEND_URL!,
        },
        body: JSON.stringify({ payload: 'test' }),
      }
    );
    expect(res.status).toBe(200);
  });
});
