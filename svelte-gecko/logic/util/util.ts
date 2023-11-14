
export function assert(test, errorMessage): asserts test {
  if (!test) {
    throw new Error(errorMessage);
  }
}

/**
 * Waits for a given number of seconds, then continues.
 */
export async function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
}
