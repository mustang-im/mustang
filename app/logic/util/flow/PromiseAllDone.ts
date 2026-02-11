import { assert } from "../util";

/**
 * Waits until all promises finished.
 * Then, if one of them failed, return the exception of the first failing.
 *
 * Unlike `Promise.all()`, this waits for all successful tasks,
 * even if one of them failed.
 * This uses `Promise.allSettled()`, but offers a shorter API.
 */
export class PromiseAllDone {
  tasks: Promise<void>[];
  constructor() {
    this.tasks = [];
  }
  add(task: Promise<void>) {
    this.tasks.push(task);
  }
  async wait() {
    let results = await Promise.allSettled(this.tasks);
    let error = results.find(result => result.status == "rejected");
    if (error) {
      assert(error.status == "rejected", "TypeScript find() is too stupid");
      throw error.reason;
    }
  }
}
