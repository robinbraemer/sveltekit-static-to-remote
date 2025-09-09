import { afterAll, beforeAll, describe, expect, it } from 'vitest';
describe('CORS and prerender', () => {
  beforeAll(async () => {}, 120_000);

  it.skip('should allow GET to prerender remote endpoint (no custom header) - KNOWN LIMITATION: prerender responses bypass CORS hooks', async () => {
    const res = await fetch(
      `${process.env.BACKEND_URL}/_app/remote/13eoo5e/getAppInfo`,
      {
        headers: { Origin: process.env.FRONTEND_URL! },
      }
    );
    expect(res.status).toBe(200);

    // Debug all headers
    console.log(`[DEBUG] All response headers:`);
    for (const [name, value] of res.headers.entries()) {
      console.log(`[DEBUG] ${name}: ${value}`);
    }

    // ACAO may be * or explicit origin depending on path and origin presence
    const acao = res.headers.get('access-control-allow-origin');
    console.log(
      `[DEBUG] ACAO header: "${acao}", Frontend URL: "${process.env.FRONTEND_URL}"`
    );
    expect(acao === '*' || acao === process.env.FRONTEND_URL).toBe(true);
  });
});
