import { enableCompileCache } from 'node:module';
import { startupBackend, shutdownBackend } from './backend';

const compileCacheDir = enableCompileCache().directory;

async function startup(): Promise<void> {
  try {
    console.log(`Backend starting with node.js ${process.version} with comile cache at ${compileCacheDir}`);
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
