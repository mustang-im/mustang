import { catchErrors } from "./error";
import { tick } from "svelte";
import { get, type Writable } from "svelte/store";

/** Protect against loops: A changes B, triggers B change, B changes A, triggers A change, and so on */
export async function avoidLoop(func: () => void, state: { inSetter: boolean }) {
  if (state?.inSetter) {
    return;
  }
  state ??= { inSetter: true };
  state.inSetter = true;
  await catchErrors(func);
  await tick();
  state.inSetter = false;
}
