import { startupBackend, shutdownBackend } from "../../../../backend/backend";
import JPCWebSocket from '../../../../lib/jpc-ws/protocol';
import { appGlobal } from '../../../logic/app';

let gJPC: JPCWebSocket;

export async function connectToBackend() {
  await startupBackend();
  let jpc = gJPC = new JPCWebSocket(null);
  const kSecret = 'eyache5C';
  await jpc.connect(kSecret, "localhost", 5453);
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
}

export async function stopBackend() {
  await gJPC.close();
  await shutdownBackend();
}
