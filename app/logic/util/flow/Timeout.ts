/**
 * Runs a function, if something takes too long.
 * Create it when you start to wait, and call `fulfilled()` once it happened.
 */
export class Timeout {
  protected readonly timer: NodeJS.Timeout;

  constructor(seconds: number, onTimeout: () => void) {
    this.timer = setTimeout(onTimeout, seconds * 1000);
  }

  /** It happened in time, so do not run `onTimeout()` */
  fulfilled(): void {
    clearTimeout(this.timer);
  }
}
