import sql from "../../../../lib/rs-sqlite/index";

export const chatDatabaseSchema = sql`
  CREATE TABLE "message" (
    "id" INTEGER PRIMARY KEY,
    "chatID" INTEGER not null,
    "idStr" TEXT default null,
    -- When this email was sent, according to RFC822 Header Date:. Unixtime, in seconds (not milliseconds as JS Date).
    "dateSent" INTEGER not null,
    -- When this email arrived here with us in the local mailbox. Unixtime, in seconds (not milliseconds as JS Date).
    "dateReceived" INTEGER not null,
    -- (The following fields are a copies of emailPersonsRel, for speed of access.)
    -- true = our user sent this; false = incoming = our user received it
    "outgoing" BOOLEAN default false,
    -- If outgoing: First To: ; if incoming: (First) From:
    "fromPersonID" INTEGER not null,
    -- plaintext content of the email body. May be converted or post-processed.
    "plaintext" TEXT default null,
    -- HTML content of the email body. May be converted or post-processed.
    "html" TEXT default null,
    -- Emoji reactions
    -- Format: { personID: number, emoji: string }[]
    "reactionsJSON" TEXT default null,
    "inReplyToMsgID" INTEGER default null,
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
    -- Last update from server we for this folder.
    "syncState" TEXT default null,
    UNIQUE("accountID", "idStr"),
    FOREIGN KEY (accountID)
      REFERENCES chatAccount (id)
      ON DELETE CASCADE
  );

  CREATE TABLE "chatAccount" (
    -- Same ID as in the preferences file
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "name" TEXT not null,
    "protocol" TEXT not null,
    "username" TEXT default null,
    "realname" TEXT not null,
    "hostname" TEXT default null,
    "port" INTEGER default null,
    "tls" INTEGER default 0,
    "url" TEXT default null,
    "configJSON" TEXT default null,
    "workspace" TEXT default null
  );
`;
