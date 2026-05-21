import { startupBackend, shutdownBackend, createJPCSecret } from './backend';
// @ts-ignore - 'bridge' is provided at runtime by capacitor-nodejs
import { channel } from 'bridge';

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
