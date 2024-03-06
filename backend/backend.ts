import { ImapFlow } from 'imapflow';
import JPCWebSocket from '../lib/jpc-ws';

export async function startupBackend() {
  let appGlobal = await createSharedAppObject();
  let jpc = new JPCWebSocket(appGlobal);
  await jpc.listen(kSecret, 5455, false);
}

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

async function createSharedAppObject() {
  return {
    createIMAPFlowConnection,
  };
}

function createIMAPFlowConnection(...args): ImapFlow {
  return new ImapFlow(...args);
}
