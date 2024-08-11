import { TLSSocketType, type MailAccount, type MailAccountStorage } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { SMTPAccount } from "../SMTP/SMTPAccount";
import type { EMail } from "../EMail";
import { SQLEMail } from "./SQLEMail";
import type { Folder } from "../Folder";
import { SQLFolder } from "./SQLFolder";
import { ContactEntry } from "../../Abstract/Person";
import { getPassword, setPassword, deletePassword } from "../../Auth/passwordStore";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLMailAccount implements MailAccountStorage {
  static async save(acc: MailAccount) {
    if (acc.outgoing) {
      if (!acc.outgoing.emailAddress) {
        acc.outgoing.emailAddress = acc.emailAddress;
      }
      await SQLMailAccount.save(acc.outgoing);
    }
    if (!acc.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM emailAccount
        WHERE
          idStr = ${acc.id}
        `) as any;
      if (existing?.id) {
        acc.dbID = existing.id;
      }
    }
    if (!acc.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO emailAccount (
          idStr, name, protocol, emailAddress,
          username,
          hostname, port, tls, authMethod, url,
          outgoingAccountID, userRealname, workspace, configJSON
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.emailAddress},
          ${acc.username},
          ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.authMethod}, ${acc.url},
          ${acc.outgoing?.dbID}, ${acc.userRealname}, ${acc.workspace?.id},
          ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE emailAccount SET
          name = ${acc.name}, emailAddress = ${acc.emailAddress},
          username = ${acc.username},
          hostname = ${acc.hostname}, port = ${acc.port}, tls = ${acc.tls}, url = ${acc.url},
          authMethod = ${acc.authMethod}, outgoingAccountID = ${acc.outgoing?.dbID},
          userRealname = ${acc.userRealname}, workspace = ${acc.workspace?.id},
          configJSON = ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        WHERE id = ${acc.dbID}
        `);
    }
    await setPassword("mail." + acc.id, acc.password);
    if (!acc.storage) {
      acc.storage = new SQLMailAccount();
    }
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(account: MailAccount) {
    assert(account.dbID, "Need account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM emailAccount
      WHERE id = ${account.dbID}
      `);
    await deletePassword("mail." + account.id);
  }

  static async read(dbID: number, acc: MailAccount) {
    assert(dbID, "Need account DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol, emailAddress,
        username, passwordButter,
        hostname, port, tls, authMethod, url,
        outgoingAccountID,
        userRealname, workspace, configJSON
      FROM emailAccount
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    assert(acc.protocol == sanitize.alphanumdash(row.protocol), "MailAccount object of wrong type passed in");
    acc.emailAddress = sanitize.emailAddress(row.emailAddress);
    acc.username = sanitize.string(row.username, null);
    acc.password = await getPassword("mail." + acc.id);
    acc.hostname = sanitize.hostname(row.hostname, null);
    acc.port = sanitize.portTCP(row.port, null);
    acc.tls = sanitize.enum(row.tls, [TLSSocketType.Plain, TLSSocketType.TLS, TLSSocketType.STARTTLS], TLSSocketType.Unknown);
    acc.authMethod = sanitize.integerRange(row.authMethod, 0, 20);
    acc.url = sanitize.url(row.url, null);
    acc.userRealname = sanitize.label(row.userRealname, appGlobal.me.name);
    acc.name = sanitize.label(row.name, acc.emailAddress);
    acc.workspace = row.workspace
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(row.workspace, null))
      : null;
    acc.fromConfigJSON(JSON.parse(sanitize.nonemptystring(row.configJSON, "{}")));
    if (!acc.storage) {
      acc.storage = new SQLMailAccount();
    }
    if (!appGlobal.me.name && acc.userRealname) {
      appGlobal.me.name = acc.userRealname;
    }
    if (!appGlobal.me.emailAddresses.find(c => c.value == acc.emailAddress)) {
      appGlobal.me.emailAddresses.add(new ContactEntry(acc.emailAddress, "account"));
    }
    let outgoingAccountID = sanitize.integer(row.outgoingAccountID, null);
    if (outgoingAccountID) {
      let outgoing = new SMTPAccount();
      await SQLMailAccount.read(outgoingAccountID, outgoing);
      acc.outgoing = outgoing;
    }
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MailAccount>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM emailAccount
      WHERE protocol <> 'smtp'
      `) as any;
    let accounts = new ArrayColl<MailAccount>();
    for (let row of rows) {
      try {
        let account = newAccountForProtocol(row.protocol);
        await SQLMailAccount.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }

  async deleteAccount(account: MailAccount): Promise<void> {
    await SQLMailAccount.deleteIt(account);
  }
  async saveAccount(account: MailAccount): Promise<void> {
    await SQLMailAccount.save(account);
  }
  async saveMessage(email: EMail): Promise<void> {
    await SQLEMail.save(email);
  }
  async saveFolder(folder: Folder): Promise<void> {
    await SQLFolder.save(folder);
  }
}
