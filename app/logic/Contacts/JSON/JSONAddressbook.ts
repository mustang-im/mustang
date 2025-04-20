import type { Addressbook } from "../Addressbook";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

export class JSONAddressbook {
  static save(acc: Addressbook): any {
    assert(acc.id, "Need account ID to save");
    let json: any = {};
    json.id = acc.id;
    json.name = acc.name;
    json.protocol = acc.protocol;
    json.url = acc.url;
    json.username = acc.username;
    json.realname = acc.realname;
    json.workspaceID = acc.workspace?.id;
    json.syncState = acc.syncState;
    return json;
  }

  static read(acc: Addressbook, json: any) {
    assert(acc.id, "Need addressbook ID to read it");
    acc.id = sanitize.alphanumdash(json.id);
    acc.name = sanitize.label(json.name);
    assert(acc.protocol == sanitize.alphanumdash(json.protocol), "Addressbook object of wrong type passed in");
    acc.username = sanitize.string(json.username, null);
    acc.url = sanitize.url(json.url, null);
    acc.realname = sanitize.label(json.realname, appGlobal.me.name ?? "You");
    acc.workspace = json.workspaceID
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(json.workspaceID, null))
      : null;
    acc.syncState = json.syncState;
    return acc;
  }
}
