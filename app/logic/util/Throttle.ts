import { arrayRemove, assert, sleep } from "./util";

/**
 * Limits the number of tasks per second.
 */
export class Throttle {
  protected nextTime: number[];
  protected perSecond = 1; // in seconds

  /**
   * @param maxTasks max count of tasks per interval
   * @param perSecond in seconds
   */
  constructor(maxTasks: number, perSecond: number) {
    this.perSecond = perSecond;
    this.nextTime = new Array(maxTasks).fill(0);
  }

  async throttle(): Promise<void> {
    let milliseconds = Date.now();
    this.nextTime.push(milliseconds + this.perSecond * 1000);
    milliseconds = (this.nextTime.shift() ?? 0) - milliseconds;
    if (milliseconds > 0) {
      console.log(`Throttling for ${milliseconds}ms because there were ${this.nextTime.length} connections in the last second`);
      await sleep(milliseconds / 1000);
    }
  }
}
