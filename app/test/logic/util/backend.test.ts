import JPCWebSocket from '../../../../lib/jpc-ws/protocol';
import { appGlobal } from '../../../logic/app';
import { production } from '../../../logic/build';

let gJPC: JPCWebSocket;

/**
 * Start dev backend: `JPC_SECRET=password-with-32-chars yarn dev`
 * Run tests: `JPC_SECRET=password-with-32-chars yarn test`
 * The env var only works in dev builds.
 * The passcode can only be alpha-num-dash chars.
 */
function getTestJPCSecret(): string {
  const env = process.env.JPC_SECRET;
  if (!env || env.length < 32) {
    throw new Error(
      "JPC_SECRET env var not set or shorter than 32 chars.\n" +
      "Set JPC_SECRET=password-with-32-chars for both the running backend\n" +
      "(`JPC_SECRET=... yarn dev`) and the test process (`JPC_SECRET=... yarn test`)."
    );
  }
  return env;
}

export async function connectToBackend() {
  let jpc = gJPC = new JPCWebSocket(null);
  await jpc.connect(getTestJPCSecret(), "localhost", production ? 5455 : 5453);
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
}

export async function stopBackend() {
  await gJPC.close();
}
