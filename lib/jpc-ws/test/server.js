import JPCWebSocket from "../protocol.js";

/////////////////////////
// Some classes

export class Movable {
  constructor() {
    this._running = false;
  }
  get running() {
    return this._running;
  }
  set running(val) {
    this._running = val;
  }
}

export class Car extends Movable {
  constructor(owner) {
    super();
    this._owner = owner;
  }
  get owner() {
    return this._owner;
  }
  set owner(val) {
    this._owner = val;
  }
  startEngine() {
    this.running = true;
  }
}

export class App {
  constructor() {
    this.cars = [
      new Car("Fred Flintstone"),
      new Car("Barney"),
    ];
  }
  testFunc() { }
}


/////////////////////////////////
// Test

export const kPort = 8672;
let jpc;

export async function start() {
  jpc = new JPCWebSocket(new App());
  await jpc.listen("test", kPort, false);
  //console.log("Server started");
}

export async function stop() {
  if (jpc) {
    jpc.stopListening();
  }
}
