/**
 * Wrapper around a slow async function to prevent it from being re-entered.
 * Call maybeRun() to attempt to invoke the async function.
 * Unlike Semaphore, attempting re-entrancy does nothing.
 * XXX need better name
 */
export class RunOnce {
  func: () => void;
  running: boolean = false;

  constructor(func: () => void) {
    this.func = func;
  }

  async maybeRun() {
    if (this.running) {
      return;
    }
    try {
      this.running = true;
      await this.func();
    } finally {
      this.running = false;
    }
  }
}
