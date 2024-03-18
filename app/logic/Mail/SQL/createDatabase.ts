import sql from "../../../../lib/rs-sqlite/index";

export const mailDatabaseSchema = sql`
  --- personal address books
  CREATE TABLE "contactAccount" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT UNIQUE
  );

  --- persons in the personal address books
  CREATE TABLE "person" (
    "id" INTEGER PRIMARY KEY,
    "contactAccountID" INTEGER,
    "name" TEXT not null,
    "firstName" TEXT,
    "lastName" TEXT,
    FOREIGN KEY (contactAccountID)
      REFERENCES contactAccount (id)
      ON DELETE SET NULL
  );

  --- Way to contact a person in the personal address book
  CREATE TABLE "personContact" (
    "personID" INTEGER,
    "value" TEXT not null,
    -- 1 = email address, 2 = chat account, 3 = phone number, 4 = street address
    "type" INTEGER not null,
    -- "phone", "fax", "email", "matrix", "xmpp", ...
    "system" TEXT,
    -- "work", "private", "mobile", user-custom values
    "purpose" TEXT,
    -- Order of preference.
    -- Lower is more preferred.
    -- Number across all contact methods. Preference value should be unique per person.
    "preference" INTEGER,
    FOREIGN KEY (personID)
      REFERENCES person (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_personContact_value ON personContact (value);
  CREATE INDEX index_personContact_personID ON personContact (personID);

  -- Email addresses, as found in received emails.
  -- They are not necessarily in the personal address book.
  CREATE TABLE "emailPerson" (
    "id" INTEGER PRIMARY KEY,
    "emailAddress" TEXT UNIQUE,
    -- Display name, as found in the email
    "name" TEXT,
    -- Optional. Should be set, if this contact is also in table persons / personContacts.
    "personID" INTEGER default null,
    FOREIGN KEY (personID)
      REFERENCES person (id)
      ON DELETE SET NULL
  );

  -- n:n table for email to emailPersons
  -- TODO Should we merge emailPersons into this table? + Less JOINs, - more duplication, + allows the name to change between emails.
  CREATE TABLE "emailPersonRel" (
    "emailID" INTEGER not null,
    "emailPersonID" INTEGER not null,
    "recipientType" INTEGER not null, -- 1 = from, 2 = to, 3 = cc, 4 = bcc, 5 = replyto, 6 = sender
    FOREIGN KEY (emailID)
      REFERENCES email (id)
      ON DELETE SET NULL,
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
    -- IMAP UID number. This is relative to the folder.
    -- See also folder.uidvalidity
    -- <https://www.rfc-editor.org/rfc/rfc3501#section-2.3.1.1>
    -- And yes, we're explicity designing that an email can only be in one folder at a time. Greetings to Gmail.
    "uid" INTEGER default null,
    -- RFC822 header
    "messageID" TEXT default null,
    "parentMsgID" TEXT default null,
    -- How many attachments this message has. TODO including m/related ?
    "attachmentsCount" INTEGER default 0,
    -- in Bytes, of RFC822 MIME message with everything
    "size" INTEGER default null,
    -- When this email was sent, according to RFC822 Header Date:
    "dateSent" INTEGER not null,
    -- When this email arrived here with us in the local mailbox
    "dateReceived" INTEGER not null,
    -- (The following fields are a copies of emailPersonsRel, for speed of access.)
    -- true = our user sent this; false = incoming = our user received it
    "outgoing" BOOLEAN default false,
    -- Email address of our user that was used, either as From (outgoing) or To/CC (incoming).
    "myEmail", TEXT default null,
    -- If outgoing: First To: ; if incoming: (First) From:
    "contactEmail" TEXT default null,
    "contactName" TEXT default null,
    -- RFC822 header Subject:
    "subject" TEXT not null,
    -- plaintext content of the email body. May be converted or post-processed.
    "plaintext" TEXT default null,
    -- HTML content of the email body. May be converted or post-processed.
    "html" TEXT default null,
    "isRead" BOOLEAN default false,
    "isStarred" BOOLEAN default false,
    "isReplied" BOOLEAN default false,
    "isSpam" BOOLEAN default false,
    FOREIGN KEY (parentMsgID)
      REFERENCES email (id)
      ON DELETE SET NULL,
    FOREIGN KEY (folderID)
      REFERENCES folder (ID)
      ON DELETE CASCADE
  );

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
    -- <https://www.rfc-editor.org/rfc/rfc3501#section-2.3.1.1>
    "uidvalidity" INTEGER default null,
    -- Last update from server we for this folder.
    -- For IMAP, that's the highest sequence number (or highest UID?)
    -- For ActiveSync, this is the last sync state. Integer sufficient?
    "lastSeen" INTEGER default null,
    UNIQUE("accountID", "path"),
    FOREIGN KEY (accountID)
      REFERENCES emailAccount (id)
      ON DELETE CASCADE
  );

  -- The email account of our user
  CREATE TABLE "emailAccount" (
    -- Same ID as in the preferences file
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null,
    "emailAddress" TEXT not null,
    "name" TEXT not null UNIQUE,
    -- "imap", "pop3", "jmap", "ews", "owa", "activesync"
    "type" TEXT not null,
    "hostname" TEXT default null,
    "port" INTEGER default null,
    "tls" INTEGER default 0,
    "url" TEXT default null,
    "username" TEXT default null,
    "passwordButter" TEXT default null
  );
`;
