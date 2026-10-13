interface ReporterOptions {
  partial?: boolean;
}

export class Reporter {
  _reporterState = {
    obj: null,
    path: [],
    options: {} as ReporterOptions,
    errors: [],
  }
  
  constructor(options: ReporterOptions = {}) {
    this._reporterState.options = options;
  }

  isError(obj): obj is ReporterError {
    return obj instanceof ReporterError;
  }

  save(): any {
    const state = this._reporterState;

    return { obj: state.obj, pathLen: state.path.length };
  }

  restore(data: any): void {
    const state = this._reporterState;

    state.obj = data.obj;
    state.path = state.path.slice(0, data.pathLen);
  }

  enterKey(key: string): number {
    return this._reporterState.path.push(key);
  }

  exitKey(index: number): void {
    const state = this._reporterState;

    state.path = state.path.slice(0, index - 1);
  }

  leaveKey(index: number, key?: string, value?: any): void {
    const state = this._reporterState;

    this.exitKey(index);
    if (state.obj) {
      state.obj[key] = value;
    }
  }

  path(): string {
    return this._reporterState.path.join('/');
  }

  enterObject(): object | null {
    const state = this._reporterState;

    const prev = state.obj;
    state.obj = {};
    return prev;
  }

  leaveObject(prev: object | null): object {
    const state = this._reporterState;

    const now = state.obj;
    state.obj = prev;
    return now;
  }

  error(msg: Error | string): any {
    let err: ReporterError;
    const state = this._reporterState;

    if (msg instanceof ReporterError) {
      err = msg;
    } else {
      err = new ReporterError(state.path.map(elem => `[${JSON.stringify(elem)}]`).join(''), typeof msg == "string" ? msg : msg.message/*, msg.stack*/);
    }

    if (!state.options.partial) {
      throw err;
    }

    if (!(msg instanceof ReporterError)) {
      state.errors.push(err);
    }

    return err;
  }

  wrapResult(result: any): any {
    const state = this._reporterState;
    if (!state.options.partial) {
      return result;
    }
    return {
      result: this.isError(result) ? null : result,
      errors: state.errors,
    };
  }
}

export class ReporterError extends Error {
  path: string;
  constructor(path: string, msg: string) {
    super(msg + ' at: ' + (path || '(shallow)'));
    this.path = path;
  }
}
