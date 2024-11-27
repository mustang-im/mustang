import sql from "../../../../lib/rs-sqlite/index";

export const mailDatabaseSchema = sql`
  -- Email addresses, as found in received emails.
  -- They are not necessarily in the personal address book.
  CREATE TABLE "emailPerson" (
    "id" INTEGER PRIMARY KEY,
    "emailAddress" TEXT,
    -- Display name, as found in the email
    "name" TEXT,
    -- Optional. Should be set, if this contact is also in table persons / personContacts.
    "personID" INTEGER default null,
    UNIQUE("emailAddress", "name")
    -- FOREIGN KEY (personID)
    --  REFERENCES person (id)
    --  ON DELETE SET NULL
  );

  -- n:n table for email to emailPersons
  -- TODO Should we merge emailPersons into this table? + Less JOINs, - more duplication
  CREATE TABLE "emailPersonRel" (
    "emailID" INTEGER not null,
    "emailPersonID" INTEGER not null,
    "recipientType" INTEGER not null, -- 1 = from, 2 = to, 3 = cc, 4 = bcc, 5 = replyto, 6 = sender
    FOREIGN KEY (emailID)
      REFERENCES email (id)
      ON DELETE CASCADE,
    FOREIGN KEY (emailPersonID)
      REFERENCES emailPerson (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_emailPersonRel_emailID ON emailPersonRel (emailID);
  CREATE INDEX index_emailPersonRel_emailPersonID ON emailPersonRel (emailPersonID);

  CREATE TABLE "email" (
    "id" INTEGER PRIMARY KEY,
    -- We're explicity designing that an email can only be in one folder at a time. Greetings to Gmail.
    "folderID" INTEGER not null,
    -- Protocol-specific ID for this email. @see EMail.pid.
    -- IMAP: UID as integer. This is relative to the folder.
    -- See also folder.uidvalidity
    -- <https://www.rfc-editor.org/rfc/rfc3501#section-2.3.1.1>
    -- EWS: ItemID as string
    -- Data type can be either string or integer or null (sqlite supports dynamic typing, per cell).
    "pID" ANY default null,
    -- RFC822 header
    "messageID" TEXT default null,
    -- In-Reply-To header
    "parentMsgID" TEXT default null,
    -- Msg-ID of the first (=top-level) message in a thread
    -- All msgs in the thread should have the same threadID, making them easy and fast to find in the DB.
    "threadID" TEXT default null,
    -- in Bytes, of RFC822 MIME message with everything
    "size" INTEGER default null,
    -- When this email was sent, according to RFC822 Header Date:. Unixtime, in seconds (not milliseconds as JS Date).
    "dateSent" INTEGER not null,
    -- When this email arrived here with us in the local mailbox. Unixtime, in seconds (not milliseconds as JS Date).
    "dateReceived" INTEGER not null,
    -- (The following fields are a copies of emailPersonsRel, for speed of access.)
    -- true = our user sent this; false = incoming = our user received it
    "outgoing" BOOLEAN default false,
    -- Email address of our user that was used, either as From (outgoing) or To/CC (incoming).
    -- "myEmail" TEXT default null,
    -- If outgoing: First To: ; if incoming: (First) From:
    -- "contactEmail" TEXT default null,
    -- "contactName" TEXT default null,
    -- RFC822 header Subject:
    "subject" TEXT not null,
    -- If not zero, then one of the following values:
    -- 1 - Request - Either an update to or a new invitation
    -- 2 - Cancellation - Organiser cancelled the event
    -- 3 - Accepted - Attendee accepted the invitation
    -- 4 - Tentative - Attendee acknowledged the invitation
    -- 5 - Declined - Attendee declined the invitation
    "scheduling" INTEGER default 0,
    -- plaintext content of the email body. May be converted or post-processed.
    "plaintext" TEXT default null,
    -- HTML content of the email body. May be converted or post-processed.
    "html" TEXT default null,
    "isRead" BOOLEAN default false,
    "isStarred" BOOLEAN default false,
    "isReplied" BOOLEAN default false,
    "isDraft" BOOLEAN default false,
    "isSpam" BOOLEAN default false,
    "downloadComplete" BOOLEAN default false,
    -- FOREIGN KEY (parentMsgID)
    --   REFERENCES email (messageID)
    --   ON DELETE SET NULL,
    FOREIGN KEY (folderID)
      REFERENCES folder (ID)
      ON DELETE CASCADE
  );

  CREATE TABLE "emailAttachment" (
    "id" INTEGER PRIMARY KEY,
    "emailID" INTEGER not null,
    -- filename with extension, as given my the email sender
    "filename" TEXT not null,
    -- filename and path where the attachment is stored on the user's local disk, after download
    -- path is relative to app root directory
    "filepathLocal" TEXT default null,
    "mimeType" TEXT not null,
    -- file size in bytes. null, if not yet downloaded
    "size" INTEGER default null,
    "disposition" TEXT default "attachment",
    "contentID" TEXT default null,
    "related" BOOLEAN default 0,
    UNIQUE("emailID", "filename"),
    FOREIGN KEY (emailID)
      REFERENCES email (ID)
      ON DELETE CASCADE
  );

  CREATE TABLE "emailTag" (
    "id" INTEGER PRIMARY KEY,
    "emailID" INTEGER not null,
    "tagName" TEXT not null,
    FOREIGN KEY (emailID)
      REFERENCES email (ID)
      ON DELETE CASCADE
  );
  CREATE INDEX index_emailTag_emailID ON emailTag (emailID);
  CREATE INDEX index_emailTag_tagName ON emailTag (tagName);

  -- Email folders, e.g. Inbox, sent, and user-custom folders
  CREATE TABLE "folder" (
    "id" INTEGER PRIMARY KEY,
    -- Which email account this folder is in
    "accountID" INTEGER not null,
    -- User-visible name
    "name" TEXT not null,
    -- Server name for the folder, relative to the account root, with delimiters
    "path" TEXT not null,
    -- Which (parent) folder this (sub) folder is in
    "parent" INTEGER default null,
    -- How many emails are in this folder.
    "countTotal" INTEGER default 0,
    -- How many unread emails (seen, but not read) are in this folder.
    "countUnread" INTEGER default 0,
    -- How many new emails (just arrived, user has not even seen the subject) are in this folder.
    "countNewArrived" INTEGER default 0,
    -- Special Use: "inbox", "sent", "drafts", "trash", "junk", "archive"
    "specialUse" TEXT default null,
    -- Last update from server we for this folder.
    -- IMAP: modseq from CONDSTORE, i.e. the highest sequence number (or highest UID?)
    -- ActiveSync and EWS: The last sync state.
    -- Data type can be either string or integer or null (sqlite supports dynamic typing, per cell).
    "syncState" ANY default null,
    -- <https://www.rfc-editor.org/rfc/rfc3501#section-2.3.1.1>
    "uidvalidity" INTEGER default null,
    UNIQUE("accountID", "path"),
    FOREIGN KEY (accountID)
      REFERENCES emailAccount (id)
      ON DELETE CASCADE
  );

  -- The email account of our user
  CREATE TABLE "emailAccount" (
    -- Same ID as in the preferences file
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "name" TEXT not null,
    "emailAddress" TEXT not null,
    -- "imap", "pop3", "jmap", "ews", "owa", "activesync"
    "protocol" TEXT not null,
    "username" TEXT default null,
    "userRealname" TEXT not null,
    "hostname" TEXT default null,
    "port" INTEGER default null,
    "tls" INTEGER default 0,
    "authMethod" INTEGER default 0,
    "outgoingAccountID" INTEGER default null,
    "url" TEXT default null,
    "configJSON" TEXT default null,
    "workspace" TEXT default null,
    FOREIGN KEY (outgoingAccountID)
      REFERENCES emailAccount (id)
      ON DELETE CASCADE
  );
`;
