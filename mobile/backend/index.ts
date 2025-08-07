import { startupBackend, shutdownBackend } from './backend';

async function startup(): Promise<void> {
  try {
    console.log(`Node.js version: ${process.version}`);
    console.log("backend starting");
    await startupBackend();
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
