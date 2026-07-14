import { expect, test, beforeAll, afterAll } from 'vitest';
import JPCWebSocket from "../protocol.js";
import { start as startServer, stop as stopServer, kPort, kSecret } from './server';

let jpc;
let app;

beforeAll(async () => {
  await startServer();
  jpc = new JPCWebSocket();
  await jpc.connect(kSecret, null, kPort);
  app = await jpc.getRemoteStartObject();
});

afterAll(async () => {
  jpc.close();
  stopServer();
});

test('Car class', async () => {
  let cars = await app.cars;
  for (let car of cars) {
    let owner = await car.owner;
    expect(owner).toBeTypeOf('string');
    expect(await car.running).toBeFalsy();
    await car.startEngine();
    expect(await car.running).toBeTruthy();
  }
});

test('Reconnect after the connection dropped', async () => {
  let reconnected = false;
  jpc.reconnectCallback = () => reconnected = true;
  // Simulate the OS dropping the socket, e.g. around sleep
  jpc._wsCall._webSocket.close();
  await sleep(50); // let the close event fire
  expect(jpc._wsCall._closed).toBe(true);
  // Made while disconnected, so it waits for the reconnect, then goes through.
  // The remote object IDs stay valid across the reconnect.
  let car = (await app.cars)[0];
  expect(await car.owner).toBe("Fred Flintstone");
  expect(reconnected).toBe(true);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
