import { Semaphore } from '../../../../logic/util/flow/Semaphore';
import { sleep } from '../../../../logic/util/util';
import { expect, test } from 'vitest';

class WithSemaphore {
  sema = new Semaphore(3);
  ran = 0;
  async run() {
    let lock = await this.sema.lock();
    try {
      await sleep(0.1);
      this.ran++;
    } finally {
      lock.release();
    }
  }
}

test("Semaphore", async () => {
  let a = new WithSemaphore();
  a.sema.maxParallel = 3;
  let promise1 = a.run();
  let promise2 = a.run();
  let promise3 = a.run();
  let promise4 = a.run();
  let promise5 = a.run();
  let promise6 = a.run();
  let promise7 = a.run();
  let promise8 = a.run();
  let promise9 = a.run();

  await promise1;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  await promise2;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  await promise3;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  await promise4;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel * 2);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  await promise5;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel * 2);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  await promise6;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel * 2);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  await promise7;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel * 3);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  expect(a.sema.countWaiting).toBe(0);
  await promise8;
  expect(a.ran).toBeLessThanOrEqual(a.sema.maxParallel * 3);
  expect(a.sema.countRunning).toBeLessThanOrEqual(a.sema.maxParallel);
  expect(a.sema.countWaiting).toBe(0);
  await promise9;
  expect(a.ran).toBe(9);
  expect(a.sema.countRunning).toBe(0);
  expect(a.sema.countWaiting).toBe(0);
});
