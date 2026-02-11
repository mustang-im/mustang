import { Throttle } from '../../../../logic/util/flow/Throttle';
import { expect, test } from 'vitest';

class WithThrottle {
  throttle = new Throttle(3, 0.1);
  ran = 0;
  async run() {
    await this.throttle.throttle();
    this.ran++;
  }
}

test("Throttle", async () => {
  let a = new WithThrottle();
  let startTime = Date.now()
  await a.run();
  await a.run();
  await a.run();
  expect(Date.now()).toBeLessThanOrEqual(startTime + 10);
  await a.run();
  await a.run();
  await a.run();
  expect(Date.now()).toBeGreaterThanOrEqual(startTime + 100);
});

test("Wait for", async () => {
  let a = new WithThrottle();
  let startTime = Date.now()
  await a.run();
  expect(Date.now()).toBeLessThanOrEqual(startTime + 10);
  a.throttle.waitForSecond(0.1);
  await a.run();
  expect(Date.now()).toBeGreaterThanOrEqual(startTime + 100);
});
