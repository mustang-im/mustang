import { SearchEMail } from "../Store/SearchEMail";
import { AceEMail } from "./AceEMail";
import { getDatabase } from "./AceDatabase";
import type { EMail } from "../EMail";
import { Folder, SpecialFolder } from "../Folder";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import { ArrayColl, MapColl } from "svelte-collections";

export class AceSearchEMail extends SearchEMail {
  /** Start a database search based on the critera set on this object */
  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    let parseError = backgroundError;
    if (this.folder && this.account) {
      assert(this.account == this.folder.account, "Folder and account need to match");
    }
    if (this.hasAttachmentMIMETypes) {
      this.hasAttachment = true;
    }
    // TODO 1:n relations attachments and recipients

    let filters: { column: string, op: any, value: string }[] = [];
    if (this.account) {
      filters.push({ column: 'accountID', op: '==', value: this.account.id });
    }

/*      SELECT
        email.id as id, folderID
      FROM email
      $${this.account?.dbID ? sql` LEFT JOIN folder ON (email.folderID = folder.id) ` : sql``}
      $${this.includesPerson ? sql` LEFT JOIN emailPersonRel ON (email.id = emailPersonRel.emailID) LEFT JOIN emailPerson ON (emailPersonRel.emailPersonID = emailPerson.id) ` : sql``}
      $${this.hasAttachment === true || this.hasAttachment === false ? sql` LEFT JOIN emailAttachment ON (email.id = emailAttachment.emailID) ` : sql``}
      $${this.tags?.hasItems ? sql` LEFT JOIN emailTag ON (email.id = emailTag.emailID) ` : sql``}
      WHERE 1=1
        $${this.account?.dbID ? sql` AND accountID = ${this.account.dbID} ` : sql``}
        $${this.folder?.dbID ? sql` AND folderID = ${this.folder.dbID} ` : sql``}
        $${typeof (this.isOutgoing) == "boolean" ? sql` AND outgoing = ${this.isOutgoing ? 1 : 0} ` : sql``}
        $${typeof (this.isRead) == "boolean" ? sql` AND isRead = ${this.isRead ? 1 : 0} ` : sql``}
        $${typeof (this.isStarred) == "boolean" ? sql` AND isStarred = ${this.isStarred ? 1 : 0} ` : sql``}
        $${typeof (this.isReplied) == "boolean" ? sql` AND isReplied = ${this.isReplied ? 1 : 0} ` : sql``}
        $${typeof (this.threadID) == "string" ? sql` AND threadID = ${this.threadID} ` : sql``}
        $${typeof (this.messageID) == "string" ? sql` AND messageID = ${this.messageID} ` : sql``}
        $${this.sizeMin ? sql` AND size >= ${this.sizeMin} ` : sql``}
        $${this.sizeMax ? sql` AND size <= ${this.sizeMax} ` : sql``}
        $${this.includesPerson?.emailAddresses.hasItems ? sql` AND emailPerson.emailAddress IN ${this.includesPerson.emailAddresses.contents.map(c => c.value)} ` : sql``}
        $${this.hasAttachment === true ? sql` AND emailAttachment.disposition = 'attachment' ` : sql``}
        $${this.hasAttachment === false ? sql` AND emailAttachment.id IS NULL ` : sql``}
        $${this.hasAttachmentMIMETypes ? sql` AND emailAttachment.mimeType IN ${this.hasAttachmentMIMETypes} ` : sql``}
        $${this.tags?.hasItems ? sql` AND emailTag.tagName IN ${this.tags.contents.map(tag => tag.name)} ` : sql``}
        $${this.bodyText ? sql` AND (LOWER(subject) LIKE ${'%' + this.bodyText.toLowerCase() + '%'} OR LOWER(plaintext) LIKE ${'%' + this.bodyText.toLowerCase() + '%'}) ` : sql``}
      GROUP BY email.id
      $${this.tags?.hasItems ? sql` HAVING COUNT(DISTINCT emailTag.tagName) = ${this.tags.length} ` : sql``}
      ORDER BY dateSent DESC
      $${limit ? sql` LIMIT ${limit} ` : sql``}
      `;
*/
    let db = await getDatabase();
    let emailJSONRows = await db.query(
      AceEMail.refBranch,
      filters,
      { include: AceEMail.kMainPropertiesInclude });

    // Find existing email obj in `folder.messages`,
    // or create new temporary `EMail` objects for the results
    let cachedFolders = new MapColl<string, Folder>(); // dbID -> folder
    const findFolder = (dbID: string): Folder | null => {
      if (!dbID) {
        return null;
      }
      if (this.folder?.dbID == dbID) {
        return this.folder;
      }
      let cached = cachedFolders.get(dbID);
      if (cached) {
        return cached;
      }
      for (let account of appGlobal.emailAccounts) {
        for (let folder of account.getAllFolders()) {
          if (folder.dbID) {
            cachedFolders.set(folder.dbID as string, folder);
          }
        }
      }
      return cachedFolders.get(dbID) ?? null;
    }
    let randomFolder = this.folder ??
      this.account?.getSpecialFolder(SpecialFolder.Inbox) ??
      appGlobal.emailAccounts.first.getSpecialFolder(SpecialFolder.Inbox);
    let emails = new ArrayColl<EMail>();
    for (let emailJSON of emailJSONRows) {
      let folder = findFolder(emailJSON.folderID);
      let existing = folder?.messages.find(msg => msg.dbID == emailJSON.id);
      if (existing) {
        emails.add(existing);
        continue;
      }
      let email = (folder ?? randomFolder).newEMail();
      try {
        await AceEMail.read(emailJSON.id, email); // TODO: Get metadata with query above first, then the email contents?
        // Do *not* add this temp `email` object to `folder.messages`
      } catch (ex) {
        parseError(ex);
      }
      emails.add(email);
    }
    return emails;
  }
}
