import type { Entity } from "../api";
import { Reporter, type ReporterError } from "../base/reporter";
import { EncoderBuffer } from "../base/buffer";
import { assert, Node } from "../base/node";
import * as der from "../constants/der";

export class DEREncoder {
  enc = "der";
  name: string;
  entity: Entity;
  tree = new DERNode();

  constructor(entity: Entity) {
    this.name = entity.name;
    this.entity = entity;
    this.tree._init(entity.body);
  }

  encode(data: any, reporter?: Reporter): Uint8Array {
    return this.tree._encode(data, reporter).join();
  }
}

// Tree methods

class DERNode extends Node {
  reporter?: Reporter;
  constructor(parent?: DERNode) {
    super("der", parent);
  }

  _createEncoderBuffer(data: any): EncoderBuffer {
    return new EncoderBuffer(data, this.reporter);
  }

  _encode(data: any, reporter: Reporter, parent?: any): any {
    const state = this._baseState;
    if (state.default !== undefined && state.default === data) {
      return;
    }
    const result = this._encodeValue(data, reporter, parent);
    if (result === undefined) {
      return;
    }
    if (this._skipDefault(result, reporter, parent)) {
      return;
    }
    return result;
  }

  _encodeValue(data: any, reporter?: Reporter, parent?: any): any {
    const state = this._baseState;

    // Decode root node
    if (!state.parent) {
      return (state.children[0] as DERNode)._encode(data, reporter || new Reporter());
    }
    let result = null;

    // Set reporter to share it with a child class
    this.reporter = reporter;

    // Check if data is there
    if (state.optional && data === undefined) {
      if (state.default === undefined) {
        return undefined;
      }
      data = state.default;
    }

    // Encode children first
    let content = null;
    let primitive = false;
    if (state.any) {
      // Anything that was given is translated to buffer
      result = this._createEncoderBuffer(data);
    } else if (state.choice) {
      result = this._encodeChoice(data, reporter);
    } else if (state.contains) {
      content = this._getUse(state.contains, parent)._encode(data, reporter);
      primitive = true;
    } else if (state.children) {
      content = state.children.map(function(child: DERNode) {
        if (child._baseState.tag === "null") {
          return child._encode(null, reporter, data);
        }
        if (!child._baseState.key) {
          return child._encode(data, reporter, parent);
        }

        const prevKey = reporter.enterKey(child._baseState.key);

        if (typeof data !== "object") {
          return reporter.error("Child expected, but input is not object");
        }

        const res = child._encode(data[child._baseState.key], reporter, data);
        reporter.leaveKey(prevKey);

        return res;
      }, this).filter(function(child) {
        return child;
      });
      content = this._createEncoderBuffer(content);
    } else {
      if (state.tag === "seqof" || state.tag === "setof") {
        // TODO(indutny): this should be thrown on DSL level
        if (!(state.args && state.args.length === 1)) {
          return reporter.error("Too many args for : " + state.tag);
        }
        if (!Array.isArray(data)) {
          return reporter.error("seqof/setof, but data is not Array");
        }
        const child = this.clone() as DERNode;
        child._baseState.implicit = undefined;
        content = this._createEncoderBuffer(data.map(function(item) {
          const state = child._baseState;

          return child._getUse(state.args[0], data)._encode(item, reporter);
        }));
      } else if (state.use) {
        result = this._getUse(state.use, parent)._encode(data, reporter);
      } else {
        content = this._encodePrimitive(state.tag, data);
        primitive = true;
      }
    }

    // Encode data itself
    if (!state.any && !state.choice) {
      const tag = state.implicit !== undefined ? state.implicit : state.tag;
      const cls = state.implicit !== undefined ? "context" : "universal";

      if (tag === undefined) {
        if (!state.use) {
          reporter.error("Tag could be omitted only for .use()");
        }
      } else {
        if (!state.use) {
          result = this._encodeComposite(tag, primitive, cls, content);
        }
      }
    }

    // Wrap in explicit
    if (state.explicit !== undefined) {
      result = this._encodeComposite(state.explicit, false, "context", result);
    }
    return result;
  }

  _encodeChoice(data: any, reporter: Reporter): EncoderBuffer {
    const state = this._baseState;

    const node = state.choice[data.type] as DERNode;
    assert(
      node,
      data.type + " not found in " +
            JSON.stringify(Object.keys(state.choice)));
    return node._encode(data.value, reporter);
  }

  _encodePrimitive(tag: string, data: any): EncoderBuffer {
    const state = this._baseState;

    if (/str$/.test(tag)) {
      return this._encodeStr(data, tag);
    } else if (tag === "objid" && state.args) {
      return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
    } else if (tag === "objid") {
      return this._encodeObjid(data);
    } else if (tag === "gentime" || tag === "utctime") {
      return this._encodeTime(data, tag);
    } else if (tag === "null") {
      return this._encodeNull();
    } else if (tag === "int" || tag === "enum") {
      return this._encodeInt(data, state.args && state.reverseArgs[0]);
    } else if (tag === "bool") {
      return this._encodeBool(data);
    } else if (tag === "objDesc") {
      return this._encodeStr(data, tag);
    } else {
      throw new Error("Unsupported tag: " + tag);
    }
  }

  _encodeComposite(tag: string | number, primitive: boolean, cls: string, content: any[]): EncoderBuffer {
    const encodedTag = encodeTag(tag, primitive, cls, this.reporter) as number;

    // Short form
    if (content.length < 0x80) {
      const header = new Uint8Array(2);
      header[0] = encodedTag;
      header[1] = content.length;
      return this._createEncoderBuffer([ header, content ]);
    }

    // Long form
    // Count octets required to store length
    let lenOctets = 1;
    for (let i = content.length; i >= 0x100; i >>= 8)
      lenOctets++;

    const header = new Uint8Array(1 + 1 + lenOctets);
    header[0] = encodedTag;
    header[1] = 0x80 | lenOctets;

    for (let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
      header[i] = j & 0xff;

    return this._createEncoderBuffer([ header, content ]);
  }

  _encodeStr(str: string | Uint8Array | { unused: number, data: Uint8Array }, tag: string): any {
    if (tag === 'bitstr') {
      assert(typeof str == "object");
      assert(!(str instanceof Uint8Array));
      return this._createEncoderBuffer([ str.unused | 0, str.data ]);
    }
    assert(typeof str == "string" || str instanceof Uint8Array);
    if (typeof str != "string") {
      return this._createEncoderBuffer(str);
    }
    else if (tag === 'bmpstr' && typeof str == "string") {
      const buf = new Uint8Array(str.length * 2);
      const view = new DataView(buf.buffer);
      for (let i = 0; i < str.length; i++) {
        view.setUint16(i * 2, str.charCodeAt(i));
      }
      return this._createEncoderBuffer(buf);
    } else if (tag === 'numstr') {
      if (!this._isNumstr(str)) {
        return this.reporter.error('Encoding of string type: numstr supports ' +
                                   'only digits and space');
      }
      return this._createEncoderBuffer(str);
    } else if (tag === 'printstr') {
      if (!this._isPrintstr(str)) {
        return this.reporter.error('Encoding of string type: printstr supports ' +
                                   'only latin upper and lower case letters, ' +
                                   'digits, space, apostrophe, left and rigth ' +
                                   'parenthesis, plus sign, comma, hyphen, ' +
                                   'dot, slash, colon, equal sign, ' +
                                   'question mark');
      }
      return this._createEncoderBuffer(str);
    } else if (/str$/.test(tag)) {
      return this._createEncoderBuffer(str);
    } else if (tag === 'objDesc') {
      return this._createEncoderBuffer(str);
    } else {
      return this.reporter.error('Encoding of string type: ' + tag +
                                 ' unsupported');
    }
  }

  _encodeObjid(id: any, values?: Record<string, string>, relative?: boolean): any {
    if (typeof id === 'string') {
      if (!values) {
        return this.reporter.error('string objid given, but no values map found');
      }
      if (!values.hasOwnProperty(id)) {
        return this.reporter.error('objid not found in values map');
      }
      id = values[id].split(/[\s.]+/g);
      for (let i = 0; i < id.length; i++) {
        id[i] |= 0;
      }
    } else if (Array.isArray(id)) {
      id = id.slice();
      for (let i = 0; i < id.length; i++) {
        id[i] |= 0;
      }
    }

    if (!Array.isArray(id)) {
      return this.reporter.error('objid() should be either array or string, ' +
                                 'got: ' + JSON.stringify(id));
    }

    if (!relative) {
      if (id[1] >= 40) {
        return this.reporter.error('Second objid identifier OOB');
      }
      id.splice(0, 2, id[0] * 40 + id[1]);
    }

    // Count number of octets
    let size = 0;
    for (let i = 0; i < id.length; i++) {
      let ident = id[i];
      for (size++; ident >= 0x80; ident >>= 7) {
        size++;
      }
    }

    const objid = new Uint8Array(size);
    let offset = objid.length - 1;
    for (let i = id.length - 1; i >= 0; i--) {
      let ident = id[i];
      objid[offset--] = ident & 0x7f;
      while ((ident >>= 7) > 0)
        objid[offset--] = 0x80 | (ident & 0x7f);
    }

    return this._createEncoderBuffer(objid);
  }

  _encodeTime(time: string | number | Date, tag: string): EncoderBuffer {
    let str;
    const date = new Date(time);

    if (tag === 'gentime') {
      str = `${date.getUTCFullYear()}${two(date.getUTCMonth() + 1)}${two(date.getUTCDate())}${two(date.getUTCHours())}${two(date.getUTCMinutes())}${two(date.getUTCSeconds())}Z`;
    } else if (tag === 'utctime') {
      str = `${two(date.getUTCFullYear() % 100)}${two(date.getUTCMonth() + 1)}${two(date.getUTCDate())}${two(date.getUTCHours())}${two(date.getUTCMinutes())}${two(date.getUTCSeconds())}Z`;
    } else {
      this.reporter.error('Encoding ' + tag + ' time is not supported yet');
    }

    return this._encodeStr(str, 'octstr');
  }

  _encodeNull(): EncoderBuffer {
    return this._createEncoderBuffer('');
  }

  _encodeInt(num: string | bigint | Uint8Array, values?: Record<string, string>): any {
    if (typeof num === 'string') {
      if (!values) {
        return this.reporter.error('String int or enum given, but no values map');
      }
      if (!values.hasOwnProperty(num)) {
        return this.reporter.error('Values map doesn\'t contain: ' +
                                   JSON.stringify(num));
      }
      num = values[num];
    }

    if (num instanceof Uint8Array) {
      return this._createEncoderBuffer(num.length ? num.slice() : new Uint8Array(1));
    }

    num = BigInt(num);
    const out = [];
    while (num < -0x80n || num > 0x7fn) {
      out.unshift(Number(BigInt.asUintN(8, num)));
      num >>= 8n;
    }
    out.unshift(Number(BigInt.asUintN(8, num)));

    return this._createEncoderBuffer(Uint8Array.from(out));
  }

  _encodeBool(value: boolean): EncoderBuffer {
    return this._createEncoderBuffer(value ? 0xff : 0);
  }

  _use(entity: Entity | ((obj: any) => Entity), obj: any): DERNode {
    if (typeof entity === 'function') {
      entity = entity(obj);
    }
    return entity._getEncoder().tree;
  }

  _getUse(entity: Entity | ((obj: any) => Entity), obj: any): DERNode {
    return super._getUse(entity, obj) as DERNode;
  }

  _skipDefault(dataBuffer: EncoderBuffer, reporter: Reporter, parent: any): boolean {
    const state = this._baseState;
    let i;
    if (state['default'] === undefined) {
      return false;
    }
    const data = dataBuffer.join();
    if (!state.defaultBuffer) {
      state.defaultBuffer = this._encodeValue(state['default'], reporter, parent).join();
    }
    if (data.length !== state.defaultBuffer.length) {
      return false;
    }
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== state.defaultBuffer[i]) {
        return false;
      }
    }
    return true;
  }
}

// Utility methods

function two(num: number): string {
  return String(num).padStart(2, "0");
}

function encodeTag(tag: string | number, primitive, cls: string, reporter: Reporter): number | ReporterError {
  let res;

  if (tag === 'seqof') {
    tag = 'seq';
  } else if (tag === 'setof') {
    tag = 'set';
  }
  if (typeof tag === 'number' && (tag | 0) === tag) {
    res = tag;
  } else if (der.tag.hasOwnProperty(tag)) {
    res = der.tag[tag];
  } else {
    return reporter.error('Unknown tag: ' + tag);
  }
  if (res >= 0x1f) {
    return reporter.error('Multi-octet tag encoding unsupported');
  }
  if (!primitive) {
    res |= 0x20;
  }
  res |= (der.tagClass[cls || 'universal'] << 6);

  return res;
}
