
export function showError(e) {
  console.error(e);
  alert(e.message);
}

export function backgroundError(e) {
  console.error(e);
}

export async function showErrors(func: Function, errorFunc = showError) {
  try {
    await func();
  } catch (ex) {
    errorFunc(ex);
  }
}
export const catchErrors = showErrors;
