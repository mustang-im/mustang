import type { TSMLAction, TSMLRequest } from "./TSML";
import type { EMail } from "../EMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Observable, notifyChangedProperty } from "../../util/Observable";
import { appGlobal } from "../../app";

export class SMLData extends Observable {
  /** `sml.@context`, normally `"https://schema.org"` */
  context: string;
  /** `sml.@type`, e.g. `"IceCreamShop"` ` */
  type: string;
  /** The complete SML JSON */
  @notifyChangedProperty
  sml: any;

  /** cache getMyReaction() */
  protected myReaction: TSMLAction;

  getMyReaction(email: EMail): TSMLAction {
    if (this.myReaction) {
      return this.myReaction;
    }

    let question = this.sml as any as TSMLRequest;

    question.reactions ??= [];
    let identities = email.folder?.account?.identities ?? appGlobal.emailAccounts.first.identities;
    let myReaction = question.reactions.find(r => r.agent?.email && identities.find(id => id.isEMailAddress(r.agent?.email)));
    if (myReaction) {
      return myReaction;
    }

    let target = question.potentialReaction?.[0]?.target;
    let myIdentity = email.getIdentity();
    myReaction = {
      agent: {
        name: myIdentity.realname,
        email: myIdentity.emailAddress,
      },
      target: target,
    } as TSMLAction;
    question.reactions ??= [];
    question.reactions.push(myReaction);
    return myReaction;
  }

  toJSON(): any {
    return this.sml;
  }
  fromJSON(json: any): void {
    this.context = sanitize.nonemptystring(json["@context"]);
    this.type = sanitize.nonemptystring(json["@type"]);
    this.sml = convertDateInObject(json);
  }
}

function convertDateInObject(json: any): any {
  if (!json) {
    return json;
  }
  if (typeof (json) == "string" && regexpDateISO8601.test(json)) {
    return new Date(json);
  }
  if (Array.isArray(json)) {
    return json.map(item => convertDateInObject(item));
  }
  if (typeof (json) == "object") {
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        json[key] = convertDateInObject(json[key]);
      }
    }
    return json;
  }
  return json;
}

export function transformDatesDuringJSONParse(key: string, value: any): any {
  if (typeof (value) == "string" && regexpDateISO8601.test(value)) {
    console.log("  is Date", new Date(value));
    return new Date(value);
  }
  return value;
}

export const regexpDateISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
