import { assert } from "./util.js";

function getClassName(obj) {
  let proto = Object.getPrototypeOf(obj);
  return (proto && (proto[Symbol.toStringTag] || proto.constructor.name)) || "Object";
}

function isPrivateProperty(propName) {
  return propName.startsWith("_") || propName == "constructor";
}

// This is only set as a function on classes that are known to be observers
function subscribe(subscriber) {
  subscriber(this);
  if (!this._subscribers) {
    this._subscribers = new Set();
  }
  this._subscribers.add(subscriber);
  return () => this._subscribers.remove(subscriber);
}

class RemoteClass {
  constructor(className) {
    this.className = className;
  }
  _notifySubscribers() {
    if (this._subscribers) {
      for (let subscriber of this._subscribers) {
        try {
          subscriber(this);
        } catch (ex) {
          console.error(ex);
          this._subscribers.delete(subscriber);
        }
      }
    }
  }
}

export default class BaseProtocol {
  callRemote(method, payload) {
    throw new Error("Implement this");
  }
  registerIncomingCall(method, listener) {
    throw new Error("Implement this");
  }
  /**
   * Called by the wire protocol implementation,
   * before calling any of the other functions.
   *
   * @param jpcProtocol {JPCProtocol} Wire protocol implementation
   */
  start(startObject) {
    this.registerIncomingCall("class", this.getClassDescription.bind(this));
    this.registerIncomingCall("start", this.mapOutgoingObjects.bind(this, startObject));
    this.registerIncomingCall("new", this.newObjListener.bind(this));
    this.registerIncomingCall("call", this.callListener.bind(this));
    this.registerIncomingCall("iter", this.iterListener.bind(this));
    this.registerIncomingCall("func", this.funcListener.bind(this));
    this.registerIncomingCall("get", this.getterListener.bind(this));
    this.registerIncomingCall("set", this.setterListener.bind(this));
    this.registerIncomingCall("observe", this.observeListener.bind(this));
    this.registerIncomingCall("del", payload => {
      this.deleteLocalObject(payload.idRemote);
    });
    if (globalThis && "FinalizationRegistry" in globalThis) {
      this._localObjectRegistry = new FinalizationRegistry(id => {
        this._localIDsToObjects.delete(id);
      });
      this._remoteObjectRegistry = new FinalizationRegistry(id => {
        this._remoteObjects.delete(id);
        this.callRemote("del", {
          idRemote: id,
        }).catch(console.error);
      });
      // TODO Free everything when client disconnects
      // See <https://github.com/tc39/proposal-weakrefs/blob/master/reference.md#notes-on-cleanup-callbacks>
      // and <https://github.com/tc39/proposal-weakrefs/issues/125>
    } else { // not supported, use dummy
      console.warn("FinalizationRegistry is not supported. This will leak everything. Please update node.js.");
      this._localObjectRegistry = {
        register: () => {},
      };
      this._remoteObjectRegistry = {
        register: () => {},
      };
    }
  }

  ///////////////////////////////////////////
  // Stub object
  // A local JS object representing a remote object

  /**
   * { Map className {string} -> prototype object {obj} }
   */
  _remoteClasses = new Map();

  /**
   * Generates a stub class
   *
   * @param classDescrJSON {JSON} Describes the remote class, see PROTOCOL.md
   * @param parent {RemoteClass?} The class this class inherits from
   */
  registerRemoteClass(classDescrJSON, parent) {
    let existing = this._remoteClasses.get(classDescrJSON.className);
    if (existing) {
      return existing;
    }

    let proto;
    if (parent) {
      proto = Object.create(parent);
      proto.className = classDescrJSON.className;
    } else {
      proto = new RemoteClass(classDescrJSON.className);
    }
    if (classDescrJSON.iterator) {
      proto[Symbol.asyncIterator] = this.makeIterator(classDescrJSON.iterator);
    }
    if (classDescrJSON.observable) {
      proto.subscribe = subscribe;
    }
    for (let func of classDescrJSON.functions) {
      proto[func.name] = this.makeFunction(func.name);
    }
    for (let getter of classDescrJSON.getters) {
      Object.defineProperty(proto, getter.name, {
        enumerable: true,
        get: this.makeGetter(getter.name),
      });
      if (getter.hasSetter) {
        let setterName = "set" + getter.name[0].toUpperCase() + getter.name.substr(1);
        proto[setterName] = this.makeSetter(getter.name);
      }
    }
    proto.newRemote = this.makeNewObj(classDescrJSON.className); // TODO static function
    this._remoteClasses.set(classDescrJSON.className, proto);
    return proto;
  }

  /**
   * Generates a stub object instance
   *
   * @param objDescrJSON {JSON} Describes the remote object, see PROTOCOL.md
   * @returns {StubObj}
   */
  async makeStub(objDescrJSON) {
    let proto = this._remoteClasses.get(objDescrJSON.className);
    if (!proto) {
      let classDescrJSON = await this.callRemote("class", {
        className: objDescrJSON.className,
      });
      for (let descr of classDescrJSON) {
        proto = this.registerRemoteClass(descr, proto);
      }
    }
    let stub = Object.create(proto);
    stub.id = objDescrJSON.idLocal;
    this.addRemoteObject(objDescrJSON.idLocal, stub);
    await this.updateObjectProperties(stub, objDescrJSON.properties);

    return stub;
  }

  async updateObjectProperties(obj, properties) {
    for (let propName in properties) {
      Object.defineProperty(obj, propName, {
        configurable: true,
        enumerable: true,
        writable: false,
        value: await this.mapIncomingObjects(properties[propName]),
      });
    }
  }

  makeCallable(id) {
    return async (...args) => {
      return await this.mapIncomingObjects(await this.callRemote("call", {
        obj: id,
        args: this.mapOutgoingObjects(args),
      }));
    }
  }

  makeIterator(symbolName) {
    let self = this;
    return async function*() {
      let remote = await self.mapIncomingObjects(await self.callRemote("iter", {
        obj: this.id,
        symbol: symbolName,
      }));
      // This object will probably be an iterable iterator,
      // but we don't want to remote that call.
      Object.getPrototypeOf(remote)[Symbol.asyncIterator] = function() { return this; };
      for await (let value of remote) {
        yield value;
      }
    }
  }

  makeFunction(functionName) {
    let self = this;
    return async function(...args) {
      // this == stub object
      return await self.mapIncomingObjects(await self.callRemote("func", {
        obj: this.id,
        name: functionName,
        args: self.mapOutgoingObjects(args),
      }));
    }
  }

  makeGetter(propName) {
    let self = this;
    return async function() {
      // this == stub object
      return await self.mapIncomingObjects(await self.callRemote("get", {
        obj: this.id,
        name: propName,
      }));
    }
  }

  makeSetter(propName) {
    let self = this;
    return async function(val) {
      // this == stub object
      return self.callRemote("set", {
        obj: this.id,
        name: propName,
        value: self.mapOutgoingObjects(val),
      });
    }
  }

  makeNewObj(className) {
    let self = this;
    return async function(...args) {
      // this == stub object
      return await self.mapIncomingObjects(await self.callRemote("new", {
        className: className,
        args: self.mapOutgoingObjects(args),
      }));
    }
  }

  /**
   * @param value {any} string, number, boolean,
   *   array, JSON obj,
   *   Object description or Object references, as defined by PROTOCOL.md
   * @return {any} same as value, just Object descriptions and Object references
   *   replaced with `StubObject`s.
   */
  async mapIncomingObjects(value) {
    if (typeof(value) == "string" ||
        typeof(value) == "number" ||
        typeof(value) == "boolean" ||
        value == null) {
      return value;
    } else if (Array.isArray(value)) {
      return Promise.all(value.map(el => this.mapIncomingObjects(el)));
    } else if (typeof(value) == "object") {
      let obj = value;
      if (obj.idLocal) {
        let stub = this.getRemoteObject(obj.idLocal);
        if (stub) {
          return stub;
        }
        if (obj.className == "Function") {
          let stub = this.makeCallable(obj.idLocal);
          this.addRemoteObject(obj.idLocal, stub);
          return stub;
        }
        return await this.makeStub(obj);
      } else if (obj.idRemote) {
        return this.getLocalObject(obj.idRemote);
      } else if (obj.plainObject) {
        let plainObject = {};
        for (let propName in obj.plainObject) {
          plainObject[propName] = await this.mapIncomingObjects(obj.plainObject[propName]);
        }
        return plainObject;
      }
    }
  }


  ///////////////////////////////////////////
  // Local object
  // Passing a normal local JS object to the remote side

  async newObjListener(payload) {
    assert(typeof(payload.className) == "string", "Need class name");
    let classCtor = global[payload.className];
    let obj;
    let args = payload.args;
    if (typeof(args) == "undefined") {
      obj = classCtor();
    } else {
      assert(Array.isArray(args), "Constructor arguments must be an array of values");
      args = await this.mapIncomingObjects(args);
      obj = classCtor(...args);
    }

    return this.createObjectDescription(obj, this.getOrCreateIDForLocalObject(obj));
  }

  async callListener(payload) {
    assert(typeof(payload.obj) == "string", "Need object ID");
    let func = this.getLocalObject(payload.obj);
    let args = await this.mapIncomingObjects(payload.args);

    // may throw
    let result = func(...args);

    if (result instanceof Promise) {
      result = await result;
    }

    return this.mapOutgoingObjects(result);
  }

  async iterListener(payload) {
    let symbol = payload.symbol;
    assert(typeof(symbol) == "string", "Need symbol name");
    assert(typeof(payload.obj) == "string", "Need object ID");
    let obj = this.getLocalObject(payload.obj);

    // may throw
    let result = obj[Symbol[symbol]]();

    return this.mapOutgoingObjects(result);
  }

  async funcListener(payload) {
    let name = payload.name;
    assert(typeof(name) == "string", "Need function name");
    assert(typeof(payload.obj) == "string", "Need object ID");
    let obj = this.getLocalObject(payload.obj);
    let args = await this.mapIncomingObjects(payload.args);

    // may throw
    let result = obj[name](...args);

    if (result instanceof Promise) {
      result = await result;
    }

    return this.mapOutgoingObjects(result);
  }

  async getterListener(payload) {
    let name = payload.name;
    assert(typeof(name) == "string", "Need property getter name");
    assert(typeof(payload.obj) == "string", "Need object ID");
    let obj = this.getLocalObject(payload.obj);

    // may throw
    let value = obj[name];

    return this.mapOutgoingObjects(value);
  }

  async setterListener(payload) {
    let name = payload.name;
    assert(typeof(name) == "string", "Need property setter name");
    assert(typeof(payload.obj) == "string", "Need object ID");
    let obj = this.getLocalObject(payload.obj);
    let value = await this.mapIncomingObjects(payload.value);

    // may throw
    obj[payload.name] = value;
  }

  async observeListener(objDescrJSON) {
    /* We get the first notification for the object when we subscribe to it;
      this happens when we first encounter the object on the server.
      At this point the remote stub does not yet exist on the client,
      since we have not yet sent the object description to the client.
      The subscription callback doesn't know that because the object already
      has a local id by this point, since we need that id in order to establish
      the subscription without creating a reference loop. */
    let obj = this.getRemoteObject(objDescrJSON.idLocal);
    if (obj) {
      await this.updateObjectProperties(obj, objDescrJSON.properties);
      obj._notifySubscribers();
    } else {
      await this.makeStub(objDescrJSON); // also fills properties
    }
  }
  /**
   * @param value {any} string, number, boolean,
   *   array, JSON obj, or
   *   local JS object
   * @return {any} same as value, just local objects replaced with
   *   Object descriptions and Object references, as defined by PROTOCOL.md
   */
  mapOutgoingObjects(value) {
    if (typeof(value) == "string" ||
        typeof(value) == "number" ||
        typeof(value) == "boolean" ||
        value == null) {
      return value;
    } else if (Array.isArray(value)) {
      return value.map(el => this.mapOutgoingObjects(el));
    } else if (typeof(value) == "function") {
      let id = this.getOrCreateIDForLocalObject(value);
      return {
        idLocal: this.getOrCreateIDForLocalObject(value),
        className: "Function",
      };
    } else if (typeof(value) == "object") {
      let obj = value;
      if (obj instanceof RemoteClass) { // TODO check working?
        return { // Object reference for remote object
          idRemote: obj.id,
        };
      }

      if (getClassName(obj) == "Object") { // JSON object -- TODO better way to check?
        let plainObject = {};
        for (let propName in obj) {
          plainObject[propName] = this.mapOutgoingObjects(obj[propName]);
        }
        return {
          plainObject: plainObject,
        };
      }

      return this.createObjectDescription(obj, this.getOrCreateIDForLocalObject(obj));
    }
  }


  /**
   * Notifies the remote end when an observable updates itself.
   */
  observe(id) {
    let props = {};
    let obj = this.getLocalObject(id);
    for (let propName in obj) {
      if (isPrivateProperty(propName)) {
        continue;
      }

      let value = obj[propName];
      if (typeof value == "function") {
        continue;
      }

      props[propName] = this.mapOutgoingObjects(value);
    }

    this.callRemote("observe", {
      idLocal: id,
      className: getClassName(obj),
      properties: props,
    });
  }

  /**
   * Return an object instance to the remote party that they did not see yet.
   *
   * @param obj {Object} local object
   * @returns {JSON} Object description, see PROTOCOL.md
   */
  createObjectDescription(obj, id) {
    let className = getClassName(obj);
    assert(className, "Could not find class name for local object");

    let props = null;
    if (typeof obj.subscribe == "function") {
      obj.subscribe(this.observe.bind(this, id));
    } else {
      for (let propName of Object.getOwnPropertyNames(obj)) {
        if (isPrivateProperty(propName)) {
          continue;
        }
        let property = Object.getOwnPropertyDescriptor(obj, propName);
        if (property.get ||
            typeof(property.value) == "function") {
          continue;
        }
        if ( !props) {
          props = {};
        }
        props[propName] = this.mapOutgoingObjects(obj[propName]);
      }
    }

    return {
      idLocal: id,
      className: className,
      properties: props,
    };
  }

  getClassDescription({className}) {
    let classDescrJSON = [];
    let proto = this._localClasses.get(className);
    while (proto) { // should always succeed; loop normally exits by break
      let descr = {
        className: className,
        iterator: null,
        observable: false,
        functions: [],
        getters: [],
        properties: [],
      };

      if (Symbol.asyncInterator in proto) {
        descr.iterator = "asyncIterator";
      } else if (Symbol.iterator in proto) {
        descr.iterator = "iterator";
      }
      for (let propName of Object.getOwnPropertyNames(proto)) {
        if (isPrivateProperty(propName)) {
          continue;
        }
        let property = Object.getOwnPropertyDescriptor(proto, propName);
        if (typeof(property.value) == "function") {
          if (propName == "subscribe") {
            descr.observable = true;
          } else {
            descr.functions.push({
              name: propName,
            });
          }
          continue;
        }
        if (typeof(property.get) == "function") {
          descr.getters.push({
            name: propName,
            hasSetter: typeof(property.set) == "function",
          });
          continue;
        }
        descr.properties.push({
          name: propName,
        });
      }

      classDescrJSON.unshift(descr);

      className = getClassName(proto);
      if (className == "Object") {
        break;
      }
      proto = Object.getPrototypeOf(proto);
    }

    return classDescrJSON;
  }


  ///////////////////////////////////////////////
  // ID to objects

  /**
   * {Map ID {string} -> remoteObject {WeakRef<StubObject>} }
   */
  _remoteObjects = new Map();
  /**
   * {Map ID {string} -> localObject {obj | WeakRef<obj>} }
   */
  _localIDsToObjects = new Map();
  /**
   * {WeakMap localObj {obj} -> ID {string} }
   */
  _localObjectsToIDs = new WeakMap();
  /**
   * {Map name {string} -> class {Prototype}
   */
  _localClasses = new Map();

  generateNewObjID() {
    let id;
    do {
      id = (Math.random() * 1e20).toFixed();
    } while (this._localIDsToObjects.has(id));
    return id;
  }

  /**
   * @param id {string} ID of object refererence
   * @returns {StubObj?} remote object
   */
  getRemoteObject(id) {
    let ref = this._remoteObjects.get(id);
    return ref && ref.deref();
  }

  /**
   * @param id {string} ID of object refererence
   * @returns {obj} local object
   */
  getLocalObject(id) {
    let obj = this._localIDsToObjects.get(id);
    assert(obj, `Local object with ID ${ id } is unknown here.`);
    if (obj instanceof WeakRef) {
      obj = obj.deref();
      assert(obj, `Local object with ID ${ id } is unknown here.`);
      this._localIDsToObjects.set(id, obj);
    }
    return obj;
  }

  /**
   * @param obj {Object} Local object
   * @returns {string} ID
   */
  getOrCreateIDForLocalObject(obj) {
    let id = this._localObjectsToIDs.get(obj);
    if (!id) {
      id = this.generateNewObjID();
      this._localObjectsToIDs.set(obj, id);
      this._localObjectRegistry.register(obj, id);
      this._localClasses.set(getClassName(obj), Object.getPrototypeOf(obj));
    }
    this._localIDsToObjects.set(id, obj);
    return id;
  }

  /**
   * @param id {string} ID for remote object, as set by the remote side
   * @param obj {StubObj} Remote object
   */
  addRemoteObject(id, obj) {
    let existing = this.getRemoteObject(id);
    assert( !existing, `Remote object ID ${ id } already exists.`);
    this._remoteObjects.set(id, new WeakRef(obj));
    this._remoteObjectRegistry.register(obj, id);
  }

  /**
   * Remote side says that it no longer needs this object.
   * Drop the reference to it.
   * @param id {string} ID of object refererence
   */
  deleteLocalObject(id) {
    let obj = this._localIDsToObjects.get(id);
    assert(obj, `Local object with ID ${ id } is unknown here.`);
    if (obj instanceof WeakRef) {
      return;
    }
    // Keep weak references in case the object gets promoted again
    this._localIDsToObjects.set(id, new WeakRef(obj));
  }

  _localObjectRegistry = null;

  _remoteObjectRegistry = null;
}
