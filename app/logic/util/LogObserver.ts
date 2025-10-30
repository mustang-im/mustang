import { ArrayColl } from "svelte-collections";
import { assert } from "./util";

export class LogObserver {
  private _originalLog?: (...args: any[]) => void;
  readonly _logHistory = new ArrayColl<string>();

  constructor(originalLog?: (...args: any[]) => void) {
    if (!originalLog) return;
    this.originalLog = originalLog;
  }

  set originalLog(originalLog: (...args: any[]) => void) {
    this._originalLog = originalLog;
    this.logHistory.clear();
    originalLog = function(...args: any[]) {
      this.logHistory.push(args);

      originalLog.apply(this, args);
    };
  }

  get originalLog(): ((...args: any[]) => void) | undefined {
    return this._originalLog;
  }

  get logHistory(): ArrayColl<string> {
    assert(!!this._originalLog, "originalLog is not set");
    return this._logHistory;
  }
}
