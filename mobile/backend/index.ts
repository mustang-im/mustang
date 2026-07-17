import { startupBackend, shutdownBackend, createJPCSecret } from './backend';
import { createRequire } from 'node:module';
// `bridge` is a runtime-provided module from capacitor-nodejs, registered only as CJS
const require = createRequire(import.meta.url);
const { channel } = require('bridge') as { channel: any };

const jpcSecret = createJPCSecret();

// Unlike Electron, the Capacitor WebView loads *before* the backend,
// so wait for the backend WebSocket to start up, so that the frontend knows when to connect.
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
