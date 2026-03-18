import { assert } from "../util";

/**
 * Allows a function to ensure that it will never run in parallel
 * with another instance of the same function.
 * Instead, it will wait until the other instance is finished.
 *
 * How to use:
 * 1. Create one instance of this class per function and object that you want to guard.
 * 1.1. If you allow multiple objects of class `A` to run their `A.runner()` independent of each
 *   other, but the same instance of `A` cannot have multiple `A.runner()` running in parallel,
 *   then A class should have an instance of this lock as property:
 *   `_runnerLock = new Lock();`.
 * 1.2. If `A.runner()` cannot run in parallel with any other `A.runner()`, even if it's on another object,
 *   then you should make the lock a `static` property on `A`:
 *   `static _runnerLock = new Lock();`
 *
 * 2. In your function, lock and unlock before and after the critical code:
 * ```
 * async runner() {
 *   await someUncriticalCode();
 *   let lock = await this._runnerLock.lock(); // will wait until the others completed
 *   try {
 *     await criticalCodePath();
 *   } finally {
 *     lock.release();
 *   }
 * }
 * ```
 *
 * 3. Callers of your function can call it in the normal way:
 * `await a.runner();`
 *
 * 4. If your function should not be repeated, you can check whether the lock()
 *   was waiting or not. If it was waiting, you can skip running your function a second time:
 * ```
 * async runner() {
 *   let lock = await this._runnerLock.lock(); // wait until the others completed
 *   if (lock.wasWaiting) {
 *     lock.release();
 *     return;
 *   }
 *   try {
 *     await someCriticalCodeWhichNeedsToRunOnlyOnce();
 *   } finally {
 *     lock.release();
 *   }
 * ```
 *   However, not that while the previous function started and this function started,
 *   your application state might have changed.
 */
export class Lock {
  protected waiting: Array<Locked> = [];

  async lock(): Promise<Locked> {
    let locked = new Locked();
    locked.wasWaiting = this.haveWaiting;
    let lastWaiting = this.waiting[this.waiting.length - 1];
    this.waiting.push(locked);
    if (locked.wasWaiting) {
      // `resolve()` in `Locked.release()`
      await lastWaiting._promise; // wait for `release()` to be called on the other lock
      let removed = this.waiting.shift(); // remove next
      assert(removed == lastWaiting, "Lock implementation logic error: I am not the currently waiting lock");
      // now, we can run
    }
    return locked;
  }

  get haveWaiting(): boolean {
    return this.waiting.length > 0;
  }
}

export class Locked {
  wasWaiting: boolean;
  _promise: Promise<null>;
  _resolve: (value: null) => void;

  constructor() {
    this._promise = new Promise(resolve => {
      this._resolve = resolve;
    });
  }

  release(): void {
    this._resolve(null);
  };
}
