import { startupBackend, shutdownBackend } from './backend';

async function startup(): Promise<void> {
  try {
    console.log(`Backend starting with node.js ${process.version}`);
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
