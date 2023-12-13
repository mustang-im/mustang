
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

export function arrayRemove(array, item) {
  let pos = array.indexOf(item);
  if (pos > -1) {
    array.splice(pos, 1);
  }
}

export function arrayRemoveAll(array, item) {
  let pos = -1;
  while ((pos = array.indexOf(item, pos)) != -1) {
    array.splice(pos, 1);
  }
}

export type URLString = string;
