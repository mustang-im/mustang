import { SearchEMail } from "./SearchEMail";
import { SQLEMail } from "./SQLEMail";
import { getDatabase } from "./SQLDatabase";
import { EMail } from "../EMail";
import { Folder, SpecialFolder } from "../Folder";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { ArrayColl, Collection, MapColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";
import { assert } from "../../util/util";

export class SQLSearchEMail extends SearchEMail {
  /** Start a database search based on the critera set on this object */
  async startSearch(limit?: number): Promise<Collection<EMail>> {
    let parseError = backgroundError;
    if (this.folder && this.account) {
      assert(this.account == this.folder.account, "Folder and account need to match");
    }
    if (this.hasAttachmentMIMETypes) {
      this.hasAttachment = true;
    }
    let contactEmail = this.contact?.emailAddresses.first?.value; // TODO add person ID to email table
    // TODO 1:n relations attachments and recipients

    // Search matching emails directly in the SQL database
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, folderID
      FROM email
      ${this.account?.dbID ? sql` LEFT JOIN folder ON (folderID = folder.id) ` : ''}
      WHERE 1=1
        ${this.account?.dbID ? sql` AND accountID = ${this.account.dbID} ` : ''}
        ${this.folder?.dbID ? sql` AND folderID = ${this.folder.dbID} ` : ''}
        ${typeof (this.isOutgoing) == "boolean" ? sql` AND outgoing = ${this.isOutgoing} ` : ''}
        ${typeof (this.isRead) == "boolean" ? sql` AND isRead = ${this.isRead} ` : ''}
        ${typeof (this.isStarred) == "boolean" ? sql` AND isStarred = ${this.isStarred} ` : ''}
        ${typeof (this.isReplied) == "boolean" ? sql` AND isReplied = ${this.isReplied} ` : ''}
        ${typeof (this.threadID) == "string" ? sql` AND threadID = ${this.threadID} ` : ''}
        ${this.sizeMin ? sql` AND size >= ${this.sizeMin} ` : ''}
        ${this.sizeMax ? sql` AND size <= ${this.sizeMax} ` : ''}
        ${contactEmail ? sql` AND contactEmail = ${contactEmail} ` : ''}
        ${this.bodyText ? sql` AND (subject LIKE '%${this.bodyText}%' OR plaintext LIKE '%${this.bodyText}%') ` : ''}
      ${limit ? sql`LIMIT ${limit}` : ''}
      `) as any;

    // Find existing email obj in `folder.messages`,
    // or create new temporary `EMail` objects for the results
    let cachedFolders = new MapColl<number, Folder>(); // dbID -> folder
    function findFolder(dbID: number): Folder | null {
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
            cachedFolders.set(folder.dbID, folder);
          }
        }
      }
      return cachedFolders.get(dbID) ?? null;
    }
    let randomFolder = this.folder ??
      this.account?.getSpecialFolder(SpecialFolder.Inbox) ??
      appGlobal.emailAccounts.first.getSpecialFolder(SpecialFolder.Inbox);
    let emails = new ArrayColl<EMail>();
    for (let row of rows) {
      let folder = findFolder(row.folderID);
      let existing = folder?.messages.find(msg => msg.dbID == row.id);
      if (existing) {
        emails.add(existing);
        continue;
      }
      let email = (folder ?? randomFolder).newEMail();
      try {
        await SQLEMail.read(row.id, email); // TODO: Get metadata with query above first, then the email contents?
        // Do *not* add this temp `email` object to `folder.messages`
      } catch (ex) {
        parseError(ex);
      }
      emails.add(email);
    }
    return emails;
  }
}
