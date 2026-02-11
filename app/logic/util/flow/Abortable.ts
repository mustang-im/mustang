import { ArrayColl, MapColl } from "svelte-collections";
import { assert } from "../util";

export class Cancelled extends Error {
  constructor(reason: string) {
    super(reason);
    this.stack = undefined;
  }
}

export interface AbortablePromise<T> extends Promise<T> {
  cancel(reason?: Cancelled | string);
}

/**
 * Returns a promise that the holder can cancel.
 * If `cancel()` is called, the Promise will fail immediately with error `Cancelled`,
 * and any successful or failed result from the underlying promise will be ignored.
 * Otherwise, the result of the underlying promise will be returned.
 */
export async function makeAbortable<T>(promise: Promise<T>, abortController?: AbortController): AbortablePromise<T> {
  let abort = abortController ?? new AbortController();
  let myReject: (ex: Error) => void;
  let isCancelled = false;
  function onCancel(reason?: Cancelled | string) {
    isCancelled = true;
    myReject(reason ? reason instanceof Cancelled ? reason : new Cancelled(reason) : new Cancelled("Cancelled"));
  }
  let abortablePromise = new Promise<T>((resolve, reject) => {
    myReject = reject;
    function onAbort() {
      onCancel();
    }
    abort.signal.addEventListener("abort", onAbort);
    promise
      .then((result: any) => {
        abort.signal.removeEventListener("abort", onAbort);
        if (!isCancelled) {
          resolve(result);
        }
      }, (ex: Error) => {
        abort.signal.removeEventListener("abort", onAbort);
        if (!isCancelled) {
          reject(ex);
        }
      });
  });
  (abortablePromise as AbortablePromise<T>).cancel = onCancel;
  return abortablePromise;
}

/**
 * Starts all requests (Promises) in parallel, and
 * resolves if they all succeeded, or fails if any of them failed.
 *
 * You can see more detailed results in the lists here, and you
 * can subscribe to them to get intermediate results.
 */
export class ParallelAbortable<T> {
  /** In order of addition */
  readonly allRequests = new ArrayColl<AbortablePromise<T>>;
  /** In order of being started */
  readonly ongoingRequests = new ArrayColl<AbortablePromise<T>>;
  /** request -> result of request */
  readonly succeededRequests = new MapColl<AbortablePromise<T>, T>;
  /** request -> Error */
  readonly failedRequests = new MapColl<AbortablePromise<T>, Error>;

  abortController: AbortController;
  protected isFinished = false;
  protected resolve: (result: T) => void;
  protected reject: (ex: Error) => void;

  constructor(abortController?: AbortController, requests?: Promise<T>[]) {
    this.abortController = abortController ?? new AbortController();
    if (requests) {
      for (let request of requests) {
        this.addRequest(request);
      }
    }
  }

  addRequest(request: AbortablePromise<T> | Promise<T>) {
    // Input
    assert(!this.isFinished, "The previous requests already finished, so cannot add new ones anymore");
    let requestA = makeAbortable(request, this.abortController);

    // Add
    this.allRequests.add(requestA);
  }

  protected startAll(oneFinished): void {
    for (let request of this.allRequests) {
      this.ongoingRequests.add(request);
      request
        .then((result: T) => {
          this.succeededRequests.set(request, result);
          this.ongoingRequests.remove(request);
          oneFinished(request);
        }, (ex: Error) => {
          this.failedRequests.set(request, ex);
          this.ongoingRequests.remove(request);
          oneFinished(request);
        });
    }
  }

  cancel(reason?: string | Cancelled) {
    let reasonC: Cancelled = reason ? reason instanceof Cancelled ? reason : new Cancelled(reason) : new Cancelled("Cancelled")
    this.isFinished = true;
    this.reject(reasonC);
    this.abortController.abort();
    for (let request of this.ongoingRequests) {
      request.cancel(reasonC);
    }
  }

  run(): Promise<T[]> {
    assert(this.allRequests.hasItems, "No requests to run");
    assert(this.ongoingRequests.isEmpty && this.succeededRequests.isEmpty && this.failedRequests.isEmpty, "Already ran");
    return new Promise((resolve, reject) => {
      const checkFinished = () => {
        if (this.isFinished) {
          return;
        }
        if (this.ongoingRequests.isEmpty && this.failedRequests.isEmpty) {
          this.isFinished = true;
          let results = this.allRequests.contents.map(r => this.succeededRequests.get(r) as T); // in original order
          resolve(results);
        } else if (this.failedRequests.first) {
          this.isFinished = true;
          reject(this.failedRequests.first);
        }
      }
      this.startAll(checkFinished);
    });
  }

  get successes(): T[] {
    return this.succeededRequests.contents;
  }
  get errors(): Error[] {
    return this.failedRequests.contents;
  }
  get errorMessages(): string[] {
    return this.errors.map(ex => ex?.message ?? ex + "");
  }
  get printResults(): string {
    return "  Succeeded:\n" +
      this.successes.join("\n\n") +
      "\n  Failed:\n    " +
      this.errorMessages.join("\n    ");
  }
}

/**
 * Runs all requests in parallel, and returns the most desired result.
 *
 * Returns the result of the first successful request, whereas "first" is
 * not the fastest, but the first in the order that you added the requests.
 *
 * If a higher priority request fails, but a lower priority request succeeds,
 * it will ignore the former failure and return the latter successful result.
 * If a higher priority request succeeds, it cancels all the lower priority requests.
 */
export class PriorityAbortable<T> extends ParallelAbortable<T> {
  run(): Promise<T> {
    assert(this.ongoingRequests.isEmpty && this.succeededRequests.isEmpty && this.failedRequests.isEmpty, "Already ran");
    return new Promise<T>((resolve, reject) => {
      const checkFinished = () => {
        if (this.isFinished) {
          return;
        }
        // all failed
        if (this.ongoingRequests.isEmpty && this.succeededRequests.isEmpty) {
          this.isFinished = true;
          reject(this.failedRequests.first);
          return;
        }
        for (let priority of this.allRequests) {
          if (this.ongoingRequests.includes(priority)) {
            return; // wait until higher priority request finishes
          }
          // this current request succeeded and no higher priority request succeeded
          if (this.succeededRequests.has(priority)) {
            this.isFinished = true;
            resolve(this.succeededRequests.get(priority) as T);
            for (let ongoing of this.ongoingRequests) {
              if (ongoing.cancel) { // TODO why is the function not defined?
                ongoing.cancel();
              }
            }
          }
        }
      }
      this.startAll(checkFinished);
    });
  }
}
