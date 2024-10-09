import type { EMail } from "../EMail";
import type { Folder } from "../Folder";
import { Attachment } from "../Attachment";
import { JSONEMail } from "../JSON/JSONEMail";
import { getDatabase } from "./AceDatabase";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

export class AceEMail {
  static readonly refBranch = "mail/email";
  static ref(email: EMail): string {
    assert(email.dbID, "Need email.dbID");
    return this.refBranch + "/" + email.dbID;
  }

  /**
   * Save only fully downloaded emails
   */
  static async save(email: EMail) {
    assert(!(email.downloadComplete && email.rawText == null && email.rawHTMLDangerous == null), "An email without body is not complete");
    if (!email.folder.dbID) {
      await email.folder.save();
    }
    let json = JSONEMail.save(email);
    if (email.dbID) {
      await appGlobal.remoteApp.aceSet(await getDatabase(), this.ref(email), json);
    } else {
      email.dbID = await appGlobal.remoteApp.acePush(await getDatabase(), this.refBranch, json);
    }
  }

  static async saveWritableProps(email: EMail) {
    let json: any = {};
    JSONEMail.saveWritableProps(email, json);
    json.tags = JSONEMail.saveTags(email);
    await appGlobal.remoteApp.aceUpdate(await getDatabase(), this.ref(email), json);
  }

  /** After downloading and saving the attachment file locally, or moving it on disk,
   * save its local disk location. */
  static async saveAttachmentFile(email: EMail, a: Attachment) {
    let json: any = {};
    json.attachments = JSONEMail.saveAttachments(email); // TODO need JSON->Ace path mapping to save only the one attachment
    await appGlobal.remoteApp.aceUpdate(await getDatabase(), this.ref(email), json);
  }

  static async saveTags(email: EMail) {
    let json: any = {};
    json.tags = JSONEMail.saveTags(email);
    await appGlobal.remoteApp.aceUpdate(await getDatabase(), this.ref(email), json);
  }

  static async read(dbID: number | string, email: EMail, json?: any): Promise<EMail> {
    if (!json) {
      json = await appGlobal.remoteApp.aceGet(await getDatabase(), this.ref(email));
    }
    JSONEMail.read(dbID, email, json);
    return email;
  }

  /** Read only the most important properties for the msg list view. */
  static async readMainProperties(dbID: number, email: EMail, json: any): Promise<void> {
    JSONEMail.readMainProperties(dbID, email, json);
  }

  static async readWritableProps(email: EMail, json?: any) {
    if (!json) {
      json = await appGlobal.remoteApp.aceGet(await getDatabase(), this.ref(email));
    }
    JSONEMail.readWritableProps(email, json);
    JSONEMail.readTags(email, json.tags);
  }

  static async deleteIt(email: EMail) {
    await appGlobal.remoteApp.aceRemove(await getDatabase(), this.ref(email));
  }

  static async readBody(email: EMail): Promise<void> {
    let json = await appGlobal.remoteApp.aceGet(await getDatabase(), this.ref(email));
    JSONEMail.readBody(email, json);
  }

  /**
   * @param limit Max number of results (optional, default all)
   * @param startWith Do not return the first `startWith` results (optional, default all)
   *
   * Adds the new emails to the folder, and updates existing emails.
   */
  static async readAll(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    if (limit) {
      return;
    }
    await JSONEMail.init();
    let db = await getDatabase();
    db.ref(this.refBranch).forEach(
      { exclude: [ "*/html", "*/plaintext" ] },
      snapshot => {
        let dbID = snapshot.key;
        let json = snapshot.val();
        let email = folder.messages.find(email => email.dbID == dbID);
        if (email) {
          JSONEMail.read(dbID, email, json);
        } else {
          email = folder.newEMail();
          JSONEMail.read(dbID, email, json);
          folder.messages.add(email);
        }
      });
  }

  /**
   * @param limit Max number of results (optional, default all)
   * @param startWith Do not return the first `startWith` results (optional, default all)
   *
   * Reads only the date, subject, read status and maybe the first sender and recipient
   */
  static async readAllMainProperties(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    if (limit) {
      return;
    }
    await JSONEMail.init();
    let db = await getDatabase();
    db.ref(this.refBranch).forEach(
      {
        include: [
          "*/id",
          "*/pID",
          "*/subject",
          "*/outgoing",
          "*/from",
          "*/to",
          "*/threadID",
          "*/inReplyTo",
          "*/size",
          "*/sent",
          "*/received",
          "*/downloadComplete",
          "*/isRead",
          "*/isStarred",
          "*/isReplied",
          "*/isSpam",
        ]
      },
      snapshot => {
        let dbID = snapshot.key;
        let json = snapshot.val();
        let email = folder.messages.find(email => email.dbID == dbID);
        if (email) {
          JSONEMail.readMainProperties(dbID, email, json);
          // Don't readRecipients(), because it would clear known cc, bcc
        } else {
          email = folder.newEMail();
          JSONEMail.readMainProperties(dbID, email, json);
          JSONEMail.readRecipients(email, json);
          folder.messages.add(email);
        }
      });
  }
}
