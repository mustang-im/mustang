import { TLSSocketType, type MailAccount } from "../MailAccount";
import { ContactEntry } from "../../Abstract/Person";
import { getWorkspaceByID } from "../../Abstract/Workspace";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

export class JSONMailAccount {
  static save(acc: MailAccount): any {
    if (acc.outgoing) {
      acc.outgoing.emailAddress ??= acc.emailAddress;
    }
    assert(acc.id, "Need account ID to save");
    let json: any = {};
    json.id = acc.id;
    json.protocol = acc.protocol;
    json.name = acc.name;
    json.userRealname = acc.userRealname;
    json.emailAddress = acc.emailAddress;
    json.username = acc.username;
    json.authMethod = acc.authMethod;
    json.url = acc.url;
    json.hostname = acc.hostname;
    json.port = acc.port;
    json.tls = acc.tls;
    json.outgoingAccountID = acc.outgoing?.id;
    json.workspaceID = acc.workspace?.id;
    json.config = acc.toConfigJSON();
    return json;
  }

  static read(acc: MailAccount, json: any) {
    (acc.id as any) = sanitize.alphanumdash(json.id);
    assert(acc.protocol == sanitize.alphanumdash(json.protocol), "MailAccount object of wrong type passed in");
    acc.emailAddress = sanitize.emailAddress(json.emailAddress);
    acc.username = sanitize.string(json.username, null);
    acc.hostname = sanitize.hostname(json.hostname, null);
    acc.port = sanitize.portTCP(json.port, null);
    acc.tls = sanitize.enum(json.tls, [TLSSocketType.Plain, TLSSocketType.TLS, TLSSocketType.STARTTLS], TLSSocketType.Unknown);
    acc.authMethod = sanitize.integerRange(json.authMethod, 0, 20);
    acc.url = sanitize.url(json.url, null);
    acc.userRealname = sanitize.label(json.userRealname, appGlobal.me.name);
    acc.name = sanitize.label(json.name, acc.emailAddress);

    acc.fromConfigJSON(json.config ?? {});
    acc.workspace = getWorkspaceByID(sanitize.string(json.workspaceID, null));
    if (!appGlobal.me.name && acc.userRealname) {
      appGlobal.me.name = acc.userRealname;
    }
    if (!appGlobal.me.emailAddresses.find(c => c.value == acc.emailAddress)) {
      appGlobal.me.emailAddresses.add(new ContactEntry(acc.emailAddress, "account"));
    }
    return acc;
  }
}
