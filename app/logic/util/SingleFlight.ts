/**
 * SingleFlight implementation to suppress duplicate async calls for the same key.
 * Similar to Go's singleflight package: https://pkg.go.dev/golang.org/x/sync/singleflight
 */
export class SingleFlight {
  private inFlight = new Map<string, Promise<any>>();

  /**
   * Executes and suppresses duplicate calls for the same key.
   */
  async do<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existingPromise = this.inFlight.get(key);

    if (existingPromise) {
      // Return the already running promise for this key
      return existingPromise;
    }

    // Start the work and store its promise
    const promise = fn().finally(() => {
      // Always remove the key once finished (successful or failed)
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Manually removes a key, forcing the next call to execute the function.
   */
  forget(key: string): void {
    this.inFlight.delete(key);
  }
}
