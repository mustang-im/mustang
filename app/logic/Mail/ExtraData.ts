import { Observable } from "../util/Observable";
import { AbstractFunction } from "../util/util";
import { EMailProcessorList } from "./EMailProcessor";

/** Allows extra data to be stored on an email.
 * Useful for data-specific processors like SML, or Calendar Invitations.
 * The data must be serialized to JSON and will be restored on load from DB. */
export class ExtraData extends Observable {
  /** Define a unique name for this classed. Used to re-construct the object from JSON. */
  static extraDataName: string = "extra";
  toJSON(): Object | null {
    throw new AbstractFunction();
  };
  fromJSON(json: Object): void {
    throw new AbstractFunction();
  };

  static hookup() {
    console.log("hookup email data", this.extraDataName);
    if (EMailProcessorList.extraDataTypes.has(this.extraDataName)) {
      return;
    }
    EMailProcessorList.extraDataTypes.set(this.extraDataName, this);
  }
  static unhookup() {
    EMailProcessorList.extraDataTypes.removeKey(this.extraDataName);
  }
}
