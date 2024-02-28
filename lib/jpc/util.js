/**
 * @param test {boolean}
 * @param errorMsg {string}
 */
export function assert(test, errorMsg) {
  if (!test) {
    throw new Error(errorMsg || "Assertion failed");
  }
}

export function consoleError(ex) {
  console.error(ex);
  console.trace(ex);
}

