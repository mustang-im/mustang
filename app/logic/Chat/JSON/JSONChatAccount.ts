import { ChatAccount } from "../ChatAccount";
import { TLSSocketType } from "../../Mail/MailAccount";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

export class JSONChatAccount {
  static save(acc: ChatAccount): any {
    assert(acc.id, "Need account ID to save");
    let json: any = {};
    json.id = acc.id;
    json.protocol = acc.protocol;
    json.name = acc.name;
    json.userRealname = acc.userRealname;
    json.username = acc.username;
    json.url = acc.url;
    json.hostname = acc.hostname;
    json.port = acc.port;
    json.tls = acc.tls;
    json.workspaceID = acc.workspace?.id;
    json.config = acc.toConfigJSON();
    return json;
  }

  static read(acc: ChatAccount, json: any) {
    (acc.id as any) = sanitize.alphanumdash(json.id);
    assert(acc.protocol == sanitize.alphanumdash(json.protocol), "MailAccount object of wrong type passed in");
    acc.username = sanitize.string(json.username, null);
    acc.hostname = sanitize.hostname(json.hostname, null);
    acc.port = sanitize.portTCP(json.port, null);
    acc.tls = sanitize.enum(json.tls, [TLSSocketType.Plain, TLSSocketType.TLS, TLSSocketType.STARTTLS], TLSSocketType.Unknown);
    acc.url = sanitize.url(json.url, null);
    acc.userRealname = sanitize.label(json.userRealname, appGlobal.me.name);
    acc.name = sanitize.label(json.name, acc.username);

    acc.fromConfigJSON(json.config ?? {});
    acc.workspace = json.workspaceID
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(json.workspaceID, null))
      : null;
    return acc;
  }
}
