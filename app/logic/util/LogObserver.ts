import { ArrayColl } from "svelte-collections";

export class LogObserver {
  private _originalLog?;
  readonly logHistory = new ArrayColl<string>();

  constructor(originalLog?: (...args: any[]) => void) {
    if (!originalLog) return;
    this.originalLog = originalLog;
  }

  set originalLog(originalLog: (...args: any[]) => void) {
    this._originalLog = originalLog;
    originalLog = function(...args: any[]) {
      this.logHistory.push(args);

      originalLog.apply(this, args);
    };
  }

  get originalLog(): (...args: any[]) => void {
    return this._originalLog;
  }
}
