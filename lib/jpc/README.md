# jpc - Remote procedure calls between JS objects in different processes

jpc allows you to call JS objects in other processes. From your JS objects, it automatically
creates an API that resembles your object API, just with an `await` in front of every call.
It then transmits the call over the channel and call the objects in the remote process,
and returns the result back to you.

It can work over various communication channels to communicate with the remote process:
* [WebSockets](https://github.com/benbucksch/jpc-ws)
* [Electron IPC](https://github.com/benbucksch/jpc-electron-ipc)
* DOM events
* TCP

# API

### Start object

This is what your client calls initially and gets the first object references from.

### Objects

The remote API is the same as the local API, just with an `await` prepended to all calls, aside from `new` and setters.

|          | Local object        | Remote object             | Difference                                       |
|----------|---------------------|---------------------------|--------------------------------------------------|
| function | `car.startEngine()` | `await car.startEngine()` | same, just with `await`                          |
| getter   | `car.owner`         | `await car.owner`         | same, just with `await`                          |
| setter   | `car.owner = val`   | `await car.setOwner(val)` | because setters always return the assigned value |
| new      | `new Car()`         | `await Car.newRemote()`   | because `new` always returns the object          |

#### Example

Given an object of class
```javascript
class Movable {
  constructor() {}
}
class Car extends Movable {
  constructor() {
    this.super();
    this._owner = "Fred Flintstone";
  }
  startEngine() {
    console.log("Engine started");
  }
  get owner {
    return this._owner;
  }
  set owner(val) {
    this._owner = val;
  }
}
```

The local API in the server process is standard JS:
```
let car = new Car();
car.owner = "Wilma";
console.log(car.owner);
car.startEngine();
```

The client API in the other process is almost the same, just with an `await` added in front of all calls:
```
let car = await Car.newRemote(); // creates a new object in the server process
await car.setOwner("Wilma");
console.log(await car.owner); // shows "Wilma" on the client
await car.startEngine(); // shows "Engine started" on the server
```
