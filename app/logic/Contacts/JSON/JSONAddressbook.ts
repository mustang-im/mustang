import type { Addressbook } from "../Addressbook";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { appGlobal } from "../../app";

export class JSONAddressbook {
  static save(acc: Addressbook): any {
    assert(acc.id, "Need account ID to save");
    let json: any = {};
    json.id = acc.id;
    json.name = acc.name;
    json.protocol = acc.protocol;
    json.url = acc.url;
    json.username = acc.username;
    json.userRealname = acc.userRealname;
    json.workspace = acc.workspace;
    json.syncState = acc.syncState;
    return json;
  }

  static read(acc: Addressbook, json: any) {
    (acc.id as any) = sanitize.alphanumdash(json.id);
    assert(acc.protocol == sanitize.alphanumdash(json.protocol), "Addressbook object of wrong type passed in");
    acc.name = sanitize.label(json.name, null);
    acc.url = sanitize.url(json.url, null);
    acc.username = sanitize.string(json.username, null);
    acc.userRealname = sanitize.label(json.userRealname, appGlobal.me.name ?? "You");
    acc.workspace = json.workspace
     ? appGlobal.workspaces.find(w => w.id == sanitize.string(json.workspace, null))
      : null;
    acc.syncState = json.syncState;
  }
}