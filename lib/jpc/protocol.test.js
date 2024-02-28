import { test, expect } from 'vitest';
import MessageCall from './message';
import JPCProtocol from './protocol';

class LPCMessage extends MessageCall {
  remote = null;
  connect(remote) {
    this.remote = remote;
    remote.remote = this;
  }
  send(message) {
    this.remote._incomingMessage(message);
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

class Collection {
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
    this._array.length = 0;
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
  let server = new LPCProtocol({ success: true, callable: function(arg) { return !arg; }, makeCollection: function() { return new Collection(); } });
  let client = new LPCProtocol();
  server.init();
  client.init();
  client.connect(server);
  let start = await client.getRemoteStartObject();
  expect(start).toBeInstanceOf(Object);
  expect(start).toHaveProperty("success", true);
  expect(start).toHaveProperty("callable");
  await expect(start.callable(false)).resolves.toBe(true);
  await expect(start.callable(true)).resolves.toBe(false);
  expect(start).toHaveProperty("makeCollection");
  let collection = await start.makeCollection();
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
    expect(client._remoteObjects.size).toBe(3);
    expect(server._localIDsToObjects.size).toBe(3);
    collection = null;
    start = null;
    await new Promise(resolve => setTimeout(resolve, 0));
    globalThis.gc();
    await new Promise(resolve => setTimeout(resolve, 0));
    globalThis.gc();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(client._remoteObjects.size).toBe(0);
    expect(server._localIDsToObjects.size).toBe(2);
    for (let [id, obj] of server._localIDsToObjects) {
      expect(obj).toBeInstanceOf(WeakRef);
    }
  } else {
    console.warn("Unable to run gc tests");
  }
});

class Interesting {
  _subscribers = new Set();
  didStuff = false;
  subscribe(subscriber) {
    subscriber(this);
    this._subscribers.add(subscriber);
    return () => this._subscribers.remove(subscriber);
  }
  doStuff() {
    this.didStuff = true;
    for (let subscriber of this._subscribers) {
      subscriber(this);
    }
  }
}

test('Observable', async () => {
  let server = new LPCProtocol({ makeObservable: function() { return new Interesting(); } });
  let client = new LPCProtocol();
  server.init();
  client.init();
  client.connect(server);
  let start = await client.getRemoteStartObject();
  expect(start).toBeInstanceOf(Object);
  expect(start).toHaveProperty("makeObservable");
  let interesting = await start.makeObservable();
  expect(interesting.didStuff).toBe(false);
  let notifications = 0;
  interesting.subscribe(() => notifications++);
  expect(notifications).toBe(1);
  await interesting.doStuff();
  // Note: This only works because the test is mostly synchronous.
  // In real life you might have to wait for the notification.
  expect(interesting.didStuff).toBe(true);
  expect(notifications).toBe(2);
});
