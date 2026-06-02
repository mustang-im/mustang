import type { Entity } from "../api";

export abstract class Builder {
  seq(...args: this[]): this { return this }
  seqof(entity: Entity): this { return this }
  set(...args: this[]): this { return this }
  setof(entity: Entity): this { return this }
  objid(oids?: Record<string, string>): this { return this }
  bool(): this { return this }
  gentime(): this { return this }
  utctime(): this { return this }
  null(): this { return this }
  enum(mapping: Record<number, string>): this { return this }
  int(): this { return this }
  objDesc(): this { return this }
  bitstr(): this { return this }
  bmpstr(): this { return this }
  charstr(): this { return this }
  genstr(): this { return this }
  graphstr(): this { return this }
  ia5str(): this { return this }
  visstr(): this { return this }
  numstr(): this { return this }
  octstr(): this { return this }
  printstr(): this { return this }
  t61str(): this { return this }
  unistr(): this { return this }
  utf8str(): this { return this }
  videostr(): this { return this }
  abstract key(key: string): this;
  abstract obj(...args: this[]): this;
  abstract use(entity: Entity): this;
  abstract optional(): this;
  abstract explicit(val: number): this;
  abstract implicit(val: number): this;
  abstract def(val: any): this;
  abstract choice(mapping: Record<string, this>): this;
  abstract any(): this;
  abstract contains(entity: Entity): this;
}

export function assert(test: any, msg?: string): asserts test {
  if (!test) {
    throw new Error(msg || "Assertion failed");
  }
}

// Supported tags
const tags = [
  "seq", "seqof", "set", "setof", "objid", "bool",
  "gentime", "utctime", "null", "enum", "int", "objDesc",
  "bitstr", "bmpstr", "charstr", "genstr", "graphstr", "ia5str", "visstr",
  "numstr", "octstr", "printstr", "t61str", "unistr", "utf8str", "videostr",
];

// Public methods list
const methods = [
  "key", "obj", "use", "optional", "explicit", "implicit", "def", "choice",
  "any", "contains",
].concat(tags);

const stateProps = [
  "enc", "parent", "children", "tag", "args", "reverseArgs", "choice",
  "optional", "any", "obj", "use", "key", "default", "explicit",
  "implicit", "contains",
];

interface State {
  enc: string;
  parent?: Node;
  children?: Node[];
  tag?: string;
  args?: any[];
  reverseArgs?: any[];
  choice?: Record<string, Node>;
  optional?: boolean;
  any?: boolean;
  obj?: boolean;
  use?: Entity;
  useDecoder?: Node;
  key?: string;
  default?: any;
  explicit?: number;
  implicit?: number;
  contains?: Entity;
  defaultBuffer?: Uint8Array;
}

export abstract class Node extends Builder {
  _baseState: State;
  constructor(enc: string, parent?: Node) {
    super();
    this._baseState = {
      enc,
      parent,
      children: (parent ? null : []),
    }

    // Should create new instance on each method
    if (!parent) {
      this._wrap();
    }
  }

  clone(): Node {
    const state = this._baseState;
    const res = new (this.constructor as new(parent: Node) => Node)(state.parent);
    Object.assign(res._baseState, state);
    return res;
  }

  _wrap(): void {
    const state = this._baseState;
    for (let method of methods) {
      this[method] = function _wrappedMethod(...args) {
        const clone = new (this.constructor as new(parent: Node) => Node)(this);
        state.children.push(clone);
        return clone[method](...args);
      };
    }
  }

  _init(body: (this: Node) => void): void {
    const state = this._baseState;

    assert(!state.parent);
    body.call(this);

    // Filter children
    state.children = state.children.filter(child => child._baseState.parent === this);
    assert(state.children.length === 1, "Root node can have only one child");
  };

  _useArgs(args: any[]): void {
    const state = this._baseState;

    // Filter children and args
    const children = args.filter(arg => arg instanceof this.constructor);
    args = args.filter(arg => !(arg instanceof this.constructor));

    if (children.length !== 0) {
      assert(!state.children);
      state.children = children;

      // Replace parent to maintain backward link
      for (let child of children) {
        child._baseState.parent = this;
      }
    }
    if (args.length !== 0) {
      assert(!state.args);
      state.args = args;
      state.reverseArgs = args.map(function(arg) {
        if (typeof arg !== "object" || arg.constructor !== Object) {
          return arg;
        }
        const res = {};
        for (let key of Object.keys(arg)) {
          const value = arg[key];
          res[value] = key == String(+key | 0) ? +key : key;
        }
        return res;
      });
    }
  }

  use(item: Entity): this {
    assert(item);
    const state = this._baseState;

    assert(!state.use);
    state.use = item;

    return this;
  }

  optional(): this {
    const state = this._baseState;

    state.optional = true;

    return this;
  }

  def(val: any): this {
    const state = this._baseState;

    assert(state.default === undefined);
    state.default = val;
    state.optional = true;

    return this;
  }

  explicit(num: any): this {
    const state = this._baseState;

    assert(state.explicit === undefined && state.implicit === undefined);
    state.explicit = num;

    return this;
  }

  implicit(num: number): this {
    const state = this._baseState;

    assert(state.explicit === undefined && state.implicit === undefined);
    state.implicit = num;

    return this;
  }

  obj(...args: this[]): this {
    const state = this._baseState;

    state.obj = true;

    if (args.length !== 0) {
      this._useArgs(args);
    }
    return this;
  }

  key(newKey: string): this {
    const state = this._baseState;

    assert(!state.key);
    state.key = newKey;

    return this;
  }

  any(): this {
    const state = this._baseState;

    state.any = true;

    return this;
  }

  choice(obj: Record<string, this>): this {
    const state = this._baseState;

    assert(!state.choice);
    state.choice = obj;
    this._useArgs(Object.values(obj));

    return this;
  }

  contains(item: Entity): this {
    const state = this._baseState;

    assert(!state.use);
    state.contains = item;

    return this;
  }

  abstract _use(entity: Entity | ((obj: any) => Entity), obj: any): Node;

  _getUse(entity: Entity | ((obj: any) => Entity), obj: any): Node {
    const state = this._baseState;

    // Create altered use decoder if implicit is set
    state.useDecoder = this._use(entity, obj);
    assert(!state.useDecoder._baseState.parent);
    state.useDecoder = state.useDecoder._baseState.children[0];
    if (state.implicit !== state.useDecoder._baseState.implicit) {
      state.useDecoder = state.useDecoder.clone();
      state.useDecoder._baseState.implicit = state.implicit;
    }
    return state.useDecoder;
  }

  _isNumstr(str: string): boolean {
    return /^[0-9 ]*$/.test(str);
  }

  _isPrintstr(str: string): boolean {
    return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str);
  }
}

//
// Public methods
//

for (let tag of tags) {
  Node.prototype[tag] = function _tagMethod(...args) {
    const state = this._baseState;

    assert(!state.tag);
    state.tag = tag;

    this._useArgs(args);

    return this;
  };
};
