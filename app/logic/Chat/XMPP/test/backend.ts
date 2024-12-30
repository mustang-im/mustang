import JPCWebSocket from '../../../../../lib/jpc-ws';
import { appGlobal } from '../../../app';

let gJPC: JPCWebSocket;

export async function startBackend() {
  const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  gJPC = jpc;
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  console.log("Connected to backend");
}

export async function stopBackend() {
  await gJPC.close();
}
