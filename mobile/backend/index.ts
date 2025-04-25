import { startupBackend, shutdownBackend } from '../../backend/backend';

async function startup(): Promise<void> {
  try {
    console.log("backend starting");
    await startupBackend();
  } catch (ex) {
    console.error(ex);
  }
}

async function shutdown(): Promise<void> {
  try {
    await shutdownBackend();
  } catch (ex) {
    console.error(ex);
  }
}

startup();
