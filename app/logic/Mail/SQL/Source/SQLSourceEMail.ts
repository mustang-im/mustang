import type { EMail } from "../../EMail";
import { getDatabase } from "./SQLSourceDatabase";
import { SQLEMail } from "../SQLEMail";
import { assert } from "../../../util/util";
import sql from "../../../../../lib/rs-sqlite";

/** Stores the RFC822 MIME source of the email,
 * for backup purposes, and for features like
 * "View source", Forward/Redirect etc. */
export class SQLSourceEMail {
  /**
   * Save only fully downloaded emails
   */
  static async save(email: EMail) {
    assert(email.mime, "Have no email source that I could save");
    if (!email.dbID) {
      await SQLEMail.save(email);
    }
    await (await getDatabase()).run(sql`
      INSERT OR REPLACE INTO emailMIME (
        emailID, messageID, mime
      ) VALUES (
        ${email.dbID}, ${email.messageID}, ${email.mime}
      )`);
  }

  static async read(email: EMail): Promise<void> {
    assert(email.dbID, "Have no email ID");
    let row = await (await getDatabase()).get(sql`
      SELECT
        mime
      FROM emailMIME
      WHERE emailID = ${email.dbID}
      `) as any;
    if (!row) {
      return;
    }
    email.mime = row.mime;
  }

  static async deleteIt(email: EMail) {
    if (!email.dbID) {
      return;
    }
    assert(email.dbID, "Need Email DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM emailMIME
      WHERE emailID = ${email.dbID}
      `);
  }
}
