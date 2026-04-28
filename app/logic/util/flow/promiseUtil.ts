
/** Finds the exceptions that happened during `Promise.allSettled()` */
export function promiseErrors<T>(results: PromiseSettledResult<T>[]): Error[] {
  let errors: Error[] = [];
  for (let result of results) {
    if (result.status == "rejected") {
      errors.push(result.reason);
    }
  }
  return errors;
}

/** Finds only the successful return values from `Promise.allSettled()` */
export function promiseSuccesses<T>(results: PromiseSettledResult<T>[]): T[] {
  let successes: T[] = [];
  for (let result of results) {
    if (result.status == "fulfilled") {
      successes.push(result.value);
    }
  }
  return successes;
}
