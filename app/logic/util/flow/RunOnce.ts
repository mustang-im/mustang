/**
 * Wrapper around an async function to prevent it from being called
 * twice at the same time.
 * The second call will wait for the first call to finish, and then get the
 * result from the first call, without calling the function a second time.
 * Similar to C++ `std::call_once`.
 */
export class RunOnce<Result> {
  running: Promise<Result> | null = null;

  async runOnce(func: () => Promise<Result>): Promise<Result> {
    try {
      if (!this.running) {
        this.running = func();
      }
      return await this.running;
    } finally {
      this.running = null;
    }
  }
}
