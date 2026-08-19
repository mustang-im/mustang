import { sleep } from "../util";

/**
 * Runs a task only once it has not been called again for some time.
 * Each call resets the wait, and only the last call runs the task.
 * E.g. save only once the user stopped typing.
 */
export class Debounce {
  protected seconds: number;
  protected waiting = 0;

  /** @param seconds How long to wait after the last call */
  constructor(seconds: number) {
    this.seconds = seconds;
  }

  async debounce(func: () => Promise<void> | void): Promise<void> {
    let waiting = ++this.waiting;
    await sleep(this.seconds);
    if (waiting != this.waiting) {
      return; // A newer call came in, which will run instead
    }
    this.waiting = 0;
    await func();
  }
}
