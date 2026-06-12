import sql, { type Database } from "../../../../lib/rs-sqlite/index";

export const chatDatabaseSchema = sql`
  CREATE TABLE "message" (
    "id" INTEGER PRIMARY KEY,
    -- Chat room (or 1:1 chat) where this message was posted
    "chatID" INTEGER not null,
    -- Protocol-specific message ID
    "idStr" TEXT default null,
    -- When this email was sent, according to RFC822 Header Date:. Unixtime, in seconds (not milliseconds as JS Date).
    "dateSent" INTEGER not null,
    -- When this email arrived here with us in the local mailbox. Unixtime, in seconds (not milliseconds as JS Date).
    "dateReceived" INTEGER not null,
    -- (The following fields are a copies of emailPersonsRel, for speed of access.)
    -- true = our user sent this; false = incoming = our user received it
    "outgoing" BOOLEAN default false,
    -- If outgoing: First To: ; if incoming: (First) From:
    -- if null, the json must contain "senderID" and "senderName" properties
    "fromPersonID" INTEGER null,
    -- plaintext content of the email body. May be converted or post-processed.
    "plaintext" TEXT default null,
    -- HTML content of the email body. May be converted or post-processed.
    "html" TEXT default null,
    -- This message is a reply to the parent message.
    -- References "message.idStr"
    "inReplyToIDStr" INTEGER default null,
    -- Emoji reactions
    -- Format: { personID: number, emoji: string }[]
    "reactionsJSON" TEXT default null,
    -- Additional data
    "json" TEXT default null,
    FOREIGN KEY (chatID)
      REFERENCES chat (ID)
      ON DELETE CASCADE
  );

  CREATE TABLE "chatAttachment" (
    "id" INTEGER PRIMARY KEY,
    "messageID" INTEGER not null,
    -- filename with extension, as given by the sender
    "filename" TEXT not null,
    -- filename and path where the attachment is stored on the user's local disk, after download
    -- path is relative to app root directory
    "filepathLocal" TEXT default null,
    "mimeType" TEXT not null,
    -- file size in bytes. null, if not yet downloaded
    "size" INTEGER default null,
    "related" BOOLEAN default 0,
    -- Additional data
    "json" TEXT default null,
    UNIQUE("messageID", "filename"),
    FOREIGN KEY (messageID)
      REFERENCES message (ID)
      ON DELETE CASCADE
  );

  -- A chat room, either 1:1 or with many participants
  CREATE TABLE "chat" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null,
    "accountID" INTEGER not null,
    -- User-visible name
    "name" TEXT not null,
    -- Person or Group that this chat room is talking with
    -- Person ID or Group ID
    "contactID" INTEGER not null,
    -- Group chat members, as JSON array of { name, userID },
    -- where userID is e.g. the JID. The members are deliberately
    -- not in the contacts DB. @see SQLChatRoom
    "members" TEXT default null,
    -- Last update from server we for this folder.
    "syncState" TEXT default null,
    -- Additional data
    "json" TEXT default null,
    UNIQUE("accountID", "idStr"),
    FOREIGN KEY (accountID)
      REFERENCES chatAccount (id)
      ON DELETE CASCADE
  );

  -- Must match the data in accounts DB
  CREATE TABLE "chatAccount" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "protocol" TEXT not null
  );
`;

/** Updates databases that were created before
 * the `members` column was added to the schema. */
export async function migrateChatDatabase(database: Database): Promise<void> {
  try {
    await database.get(sql`SELECT members FROM chat LIMIT 1`);
  } catch (ex) {
    if (ex?.message?.startsWith("no such column")) {
      await database.execute(sql`ALTER TABLE "chat" ADD COLUMN "members" TEXT default null;`);
    } else {
      throw ex;
    }
  }
}
