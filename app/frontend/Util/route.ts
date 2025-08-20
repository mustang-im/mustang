import { get, type Writable } from "svelte/store";
import { useLocation, type NavigatorLocation } from "svelte-navigator";

export function ensureLoaded(obj: Writable<any>, fallbackURL: string): string {
  if (get(obj)) {
    return "";
  }
  window.location.href = fallbackURL;
}

export function ensureIDMatch<T extends { id: string }>(obj: T, idParam: string, findObjectByID: (id: string) => T): string {
  if (obj) {
    if (obj.id != idParam) {
      return `Object on history stack ${obj.id} does not match the URL parameter ${idParam}`;
    }
  } else {
    let obj = findObjectByID(idParam);
    if (!obj) {
      return `Object in URL param ${idParam} not found`;
    }
    // TODO return obj
  }
  return "";
}

export function requiredParam(): any {
  let loc = useLocation();
  let location = get(loc);
  throw new Error(`Object missing for screen ${location.pathname}`);
}
