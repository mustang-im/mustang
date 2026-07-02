import { StallTimeout } from '../../../../lib/util/StallTimeout';
import ky from 'ky';
import http from 'node:http';
import { expect, test } from 'vitest';

/** Like `kyCreate()` in the backends */
async function getJSON(url: string, timeout: number): Promise<any> {
  let stall = new StallTimeout(timeout, url);
  try {
    return await ky.get(url, stall.wrapOptions({ timeout })).json();
  } finally {
    stall.stop();
  }
}

/** A connection that breaks mid-response must fail with an error, not hang
 * forever - and with it the mail sync and everything waiting for its lock. #1252 */
test("Server stops sending mid-response", async () => {
  let server = await startServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write('{ "foo":'); // start the response, then stall forever
  });
  try {
    await expect(getJSON(server.url, 300)).rejects.toThrow(/stopped sending/);
  } finally {
    server.stop();
  }
}, 5000);

test("Server never responds", async () => {
  let server = await startServer(() => {
    // Read the request, but never respond. Covered by ky's own `timeout`.
  });
  try {
    await expect(getJSON(server.url, 300)).rejects.toThrow();
  } finally {
    server.stop();
  }
}, 5000);

/** Data keeps arriving, so the stall timeout restarts,
 * even though the whole response takes longer than `timeout`. */
test("Slow but continuous response succeeds", async () => {
  let chunks = ['[ "a"', ', "b"', ', "c"', ', "d"', ', "e"', ', "f"', ' ]'];
  let server = await startServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    let i = 0;
    let interval = setInterval(() => {
      res.write(chunks[i++]);
      if (i == chunks.length) {
        clearInterval(interval);
        res.end();
      }
    }, 100); // each gap < timeout, but whole response > timeout
  });
  try {
    await expect(getJSON(server.url, 300)).resolves.toEqual(["a", "b", "c", "d", "e", "f"]);
  } finally {
    server.stop();
  }
}, 5000);

test("Normal response", async () => {
  let server = await startServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end('{ "foo": 42 }');
  });
  try {
    await expect(getJSON(server.url, 300)).resolves.toEqual({ foo: 42 });
  } finally {
    server.stop();
  }
}, 5000);

async function startServer(handler: http.RequestListener): Promise<{ url: string, stop: () => void }> {
  let server = http.createServer(handler);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  let port = (server.address() as any).port;
  return {
    url: `http://127.0.0.1:${port}/`,
    stop: () => {
      server.closeAllConnections();
      server.close();
    },
  };
}
