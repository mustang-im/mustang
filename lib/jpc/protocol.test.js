import { test, expect } from 'vitest';
import MessageCall from './message';
import JPCProtocol from './protocol';

class LPCMessage extends MessageCall {
  queue = [];
  interval = null;
  remote = null;
  connect(remote) {
    this.remote = remote;
    remote.remote = this;
  }
  send(message) {
    this.queue.push(message);
    if (!this.interval) {
      this.interval = setInterval(() => {
        let message = this.queue.shift();
        if (!this.queue.length) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.remote._incomingMessage(message);
      }, 10);
    }
  }
}

class LPCProtocol extends JPCProtocol {
  message = new LPCMessage();
  connect(remote) {
    this.message.connect(remote.message);
  }
  registerIncomingCall(method, listener) {
    this.message.register(method, listener);
  }
  callRemote(method, payload) {
    return this.message.makeCall(method, payload);
  }
}

class Connection {
  capabilities = new Map();
  run(command) {
    switch (command) {
    case 'CAPABILITY':
      this.capabilities = new Map([["IMAP4rev1", true]]);
      return true;
    case 'NAMESPACE':
      this.namespaces = { personal: [{ prefix: "", delimiter: "." }], other: [], shared: [] };
      return true;
    default:
      return false;
    }
  }
}

class Collection {
  self = this;
  _array = [];
  add(item) {
    this._array.push(item);
    return true;
  }
  remove(item) {
    let pos = this._array.indexOf(item);
    if (pos < 0) {
      return false;
    }
    this._array.splice(pos, 1);
    return true;
  }
  clear() {
    if (!this._array.length) {
      return false;
    }
    this._array.length = 0;
    return true;
  }
  get isEmpty() {
    return this._array.length == 0;
  }
  get size() {
    return this._array.length;
  }
  set size(val) {
    this._array.length = val;
  }
  contains(item) {
    return this._array.includes(item);
  }
}

test('Protocol', async () => {
  let server = new LPCProtocol({ success: true, callable: function(arg) { return !arg; }, makeConnection: function() { return new Connection(); }, makeCollection: function() { return new Collection(); } });
  let client = new LPCProtocol();
  await server.init();
  await client.init();
  client.connect(server);
  let start = await client.getRemoteStartObject();
  expect(start).toBeInstanceOf(Object);
  expect(start).toHaveProperty("success", true);
  expect(start).toHaveProperty("callable");
  await expect(start.callable(false)).resolves.toBe(true);
  await expect(start.callable(true)).resolves.toBe(false);
  expect(start).toHaveProperty("makeConnection");
  let connection = await start.makeConnection();
  await expect(connection.capabilities.size).resolves.toBe(0);
  expect(connection.run('CAPABILITY')).resolves.toBe(true);
  await expect(connection.capabilities.size).resolves.toBe(0);
  await connection.__refresh();
  await expect(connection.capabilities.size).resolves.toBe(1);
  await expect(connection.capabilities.get('IMAP4rev1')).resolves.toBe(true);
  expect(connection).not.toHaveProperty("namespaces");
  expect(connection.run('NAMESPACE')).resolves.toBe(true);
  expect(connection).not.toHaveProperty("namespaces");
  await connection.__refresh();
  expect(connection).toHaveProperty("namespaces");
  expect(start).toHaveProperty("makeCollection");
  let collection = await start.makeCollection();
  expect(collection).toHaveProperty("self", collection);
  await expect(collection.isEmpty).resolves.toBe(true);
  await collection.add(0);
  await collection.add("");
  await collection.add(null);
  await collection.add(false);
  await expect(collection.isEmpty).resolves.toBe(false);
  await expect(collection.size).resolves.toBe(4);
  await expect(collection.contains(false)).resolves.toBe(true);
  await expect(collection.contains(true)).resolves.toBe(false);
  await collection.setSize(3);
  await expect(collection.remove(0)).resolves.toBe(true);
  await expect(collection.size).resolves.toBe(2);
  await expect(collection.remove(0)).resolves.toBe(false);
  await collection.clear();
  await expect(collection.isEmpty).resolves.toBe(true);
  if (globalThis.gc) {
    expect(client._remoteObjects.size).toBe(7);
    expect(server._localIDsToObjects.size).toBe(7);
    collection = null;
    connection = null;
    start = null;
    await new Promise(resolve => setTimeout(resolve, 0));
    globalThis.gc();
    await new Promise(resolve => setTimeout(resolve, 0));
    globalThis.gc();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(client._remoteObjects.size).toBe(0);
    expect(server._localIDsToObjects.size).toBe(3);
    for (let [id, obj] of server._localIDsToObjects) {
      expect(obj).toBeInstanceOf(WeakRef);
    }
  } else {
    console.warn("Unable to run gc tests");
  }
});

class ObservableCollection extends Collection {
  self = null;
  _subscribers = new Set();
  subscribe(subscriber) {
    subscriber(this);
    this._subscribers.add(subscriber);
    return () => this.subscribers.remove(subscriber);
  }
  _notifySubscribers() {
    for (let subscriber of this._subscribers) {
      subscriber(this);
    }
  }
  _notifySubscribersIf(condition) {
    if (condition) {
      this._notifySubscribers();
    }
    return condition;
  }
  add(item) {
    return this._notifySubscribersIf(super.add(item));
  }
  remove(item) {
    return this._notifySubscribersIf(super.remove(item));
  }
  clear() {
    return this._notifySubscribersIf(super.clear());
  }
  get size() {
    return super.size;
  }
  set size(val) {
    return this._notifySubscribersIf(this._array.length != (super.size = val));
  }
}

test('Observable', async () => {
  let server = new LPCProtocol({ makeObservable: function() { return new ObservableCollection(); } });
  let client = new LPCProtocol();
  await server.init();
  await client.init();
  await client.connect(server);
  let start = await client.getRemoteStartObject();
  expect(start).toBeInstanceOf(Object);
  expect(start).toHaveProperty("makeObservable");
  let collection = await start.makeObservable();
  let notifications = 0;
  collection.subscribe(() => notifications++);
  expect(notifications).toBe(1);
  expect(collection.isEmpty).toBe(true);
  await collection.add(0); // notifies
  await collection.add(""); // notifies
  await collection.add(null); // notifies
  await collection.add(false); // notifies
  expect(collection.isEmpty).toBe(false);
  expect(collection.size).toBe(4);
  await expect(collection.contains(false)).resolves.toBe(true);
  await expect(collection.contains(true)).resolves.toBe(false);
  await collection.setSize(3); // notifies
  await expect(collection.remove(0)).resolves.toBe(true); // notifies
  expect(collection.size).toBe(2);
  await expect(collection.remove(0)).resolves.toBe(false);
  await collection.clear(); // notifies
  expect(collection.isEmpty).toBe(true);
  // Note: This only works because the test is mostly synchronous.
  // In real life you might have to wait for the notification.
  expect(notifications).toBe(8);
});
