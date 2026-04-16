import type { TJMAPChangeResponse, TJMAPSetError } from './TJMAPGeneric';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { SpecificError } from "../../util/util";

export class JMAPCommandError extends SpecificError {
}

export class JMAPChangeError extends Error {
  type: string;
  constructor(jmapError: TJMAPSetError, highLevelMessage: string) {
    let msg = highLevelMessage;
    if (jmapError.description) {
      msg += ": " + sanitize.nonemptylabel(jmapError.description, "");
    }
    if (jmapError.properties) {
      msg += " (" + sanitize.nonemptylabel(jmapError.properties.join(", "), "") + ")";
    }
    super(msg);
    this.type = sanitize.alphanumdash(jmapError.type, null);
  }
}

/** @throws if the server reported an error */
export function checkChangeError(response: TJMAPChangeResponse<any>) {
  let first: any;
  if (first = getFirst(response.notCreated)) {
    throw new JMAPChangeError(first, "Failed to add on server");
  }
  if (first = getFirst(response.notUpdated)) {
    throw new JMAPChangeError(first, "Failed to update on server");
  }
  if (first = getFirst(response.notDestroyed)) {
    throw new JMAPChangeError(first, "Failed to delete on server");
  }
  // else: return without error
}

function getFirst(mappedErrors: Record<string, TJMAPSetError>): TJMAPSetError | undefined {
  if (!mappedErrors) {
    return undefined;
  }
  return Object.values(mappedErrors)[0];
}
