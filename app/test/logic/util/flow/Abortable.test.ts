import { expect, test } from 'vitest'
import { makeAbortable, ParallelAbortable, PriorityAbortable } from '../../../../logic/util/flow/Abortable';
import { sleep } from '../../../../logic/util/util';

function testSuccess(result = 5): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(result);
    }, 10 + Math.floor(Math.random() * 5));
  });
}

const kFailMsg = "Intentionally failing";

function testFail(): Promise<5> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let ex = new Error(kFailMsg);
      ex.stack = undefined;
      reject(ex);
    }, 10 + Math.floor(Math.random() * 5));
  });
}

function randomNumbers(count: number): number[] {
  let results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * 1000));
  }
  return results;
}

test("testSuccess()", async () => {
  let result = await testSuccess();
  expect(result).toBe(5);
});

test("testFail()", async () => {
  await expect(testFail()).rejects.toThrowError(kFailMsg);
});

test("Abortable succeeds", async () => {
  let result = await makeAbortable(testSuccess());
  expect(result).toBe(5);
});


test("Abortable fails", async () => {
  await expect(makeAbortable(testFail())).rejects.toThrowError(kFailMsg);
});

test("Cancel Abortable", async () => {
  let abortController = new AbortController();
  let abortable = makeAbortable(testSuccess(), abortController);
  await sleep(0.0001);
  abortController.abort();
  await expect(abortable).rejects.toThrowError("Cancelled");
});

test("ParallelAbortable success", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  let parallel = new ParallelAbortable(abortController, promises);
  await expect(parallel.run()).resolves.toStrictEqual(results);
});

test("ParallelAbortable failed", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  promises[2] = testFail();
  let parallel = new ParallelAbortable(abortController, promises);
  await expect(parallel.run()).rejects.toThrow();
});

test("ParallelAbortable cancelled", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  let parallel = new ParallelAbortable(abortController, promises);
  let promise = parallel.run();
  await sleep(0.0001);
  abortController.abort();
  await expect(promise).rejects.toThrowError("Cancelled");
});


test("PriorityAbortable success", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  let priority = new PriorityAbortable(abortController, promises);
  await expect(priority.run()).resolves.toStrictEqual(results[0]);
});

test("PriorityAbortable failed lower priority", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  promises[2] = testFail();
  let priority = new PriorityAbortable(abortController, promises);
  await expect(priority.run()).resolves.toStrictEqual(results[0]);
});

test("PriorityAbortable failed highest priority", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  promises[0] = testFail();
  let priority = new PriorityAbortable(abortController, promises);
  await expect(priority.run()).resolves.toStrictEqual(results[1]);
});

test("PriorityAbortable failed all", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testFail());
  let priority = new PriorityAbortable(abortController, promises);
  await expect(priority.run()).rejects.toThrowError(kFailMsg);
});

test("PriorityAbortable cancelled", async () => {
  let abortController = new AbortController();
  let results = randomNumbers(5);
  let promises = results.map(result => testSuccess(result));
  let priority = new PriorityAbortable(abortController, promises);
  let promise = priority.run();
  await sleep(0.0001);
  abortController.abort();
  await expect(promise).rejects.toThrowError("Cancelled");
});
