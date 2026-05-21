import { startupBackend, shutdownBackend, createJPCSecret } from './backend';
import { createRequire } from 'node:module';
// `bridge` is a runtime-provided module from capacitor-nodejs, registered only as CJS
const require = createRequire(import.meta.url);
const { channel } = require('bridge') as { channel: any };

const jpcSecret = createJPCSecret();

// The Capacitor WebView asks for the secret via this channel before it
// opens its WebSocket. We only respond once `startupBackend()` has actually
// started listening, so the WebView can connect immediately after.
let resolveStarted: () => void;
const started = new Promise<void>(resolve => { resolveStarted = resolve; });

channel.addListener('jpc:get-secret', async () => {
  await started;
  channel.send('jpc:secret', jpcSecret);
});

async function startup(): Promise<void> {
  try {
    console.log(`Backend starting with node.js ${process.version}`);
    await startupBackend(jpcSecret);
    resolveStarted();
  } catch (ex) {
    console.error(ex);
  }
}

async function shutdown(): Promise<void> { // TODO call
  try {
    await shutdownBackend();
  } catch (ex) {
    console.error(ex);
  }
}

startup();
