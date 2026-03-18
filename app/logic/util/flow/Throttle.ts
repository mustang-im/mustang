import { sleep } from "../util";

/**
 * Limits the number of tasks per second.
 */
export class Throttle {
  protected nextTime: number[];
  protected perSecond = 1; // in seconds

  /**
   * @param maxTasks max count of tasks per interval
   * @param perSecond interval, in seconds
   */
  constructor(maxTasks: number, perSecond: number) {
    this.perSecond = perSecond;
    this.nextTime = new Array(maxTasks).fill(0);
  }

  async throttle(): Promise<void> {
    let now = Date.now();
    this.nextTime.push(now + this.perSecond * 1000);
    let waitFor = (this.nextTime.shift() ?? 0) - now;
    if (waitFor > 0) {
      console.log(`Throttling for ${waitFor}ms because there were ${this.nextTime.length} connections in the last ${this.perSecond} second`);
      await sleep(waitFor / 1000);
    }
  }

  waitForSecond(seconds: number) {
    this.nextTime.unshift(Date.now() + seconds * 1000);
  }

  get maxTasks(): number {
    return this.nextTime.length;
  }
  set maxTasks(max: number) {
    let oldMax = this.nextTime.length;
    if (max == oldMax) {
      return;
    }
    this.nextTime.length = max;
    if (oldMax < max) {
      this.nextTime.fill(0, oldMax);
    }
  }
}
