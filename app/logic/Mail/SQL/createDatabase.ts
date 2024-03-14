import sql from "../../../../lib/rs-sqlite/index";

export const mailDatabaseSchema = sql`
  --- personal address books
  CREATE TABLE "contactAccount" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
  );
  --- persons in the personal address books
  CREATE TABLE "persons" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "contactAccountID" INTEGER,
    "name" TEXT not null,
    "firstName" TEXT,
    "lastName" TEXT,
    FOREIGN KEY (contactAccountID)
      REFERENCES contactAccount (id)
      ON DELETE SET NULL
  );
  --- Way to contact a person in the personal address book
  CREATE TABLE "personContacts" (
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
  -- Email addresses, as found in received emails.
  -- They are not necessarily in the personal address book.
  CREATE TABLE "emailPersons" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "emailAddress" TEXT,
    -- Display name, as found in the email
    "name" TEXT,
    -- Optional. Should be set, if this contact is also in table persons / personContacts.
    "personID" INTEGER default null,
    FOREIGN KEY (personID)
      REFERENCES persons (id)
      ON DELETE SET NULL
  );
  -- n:n table for email to emailPersons
  CREATE TABLE "emailPersonsRel" (
    "emailID" INTEGER not null,
    "emailPersonID" INTEGER not null,
    "fromToCC" INTEGER not null, -- 1 = from, 2 = to, 3 = cc, 4 = bcc, 5 = replyto, 6 = sender
    FOREIGN KEY (emailID)
      REFERENCES email (id)
      ON DELETE SET NULL,
    FOREIGN KEY (emailPersonID)
      REFERENCES emailPerson (id)
      ON DELETE CASCADE
  );
  CREATE TABLE "email" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    -- From RFC822 header
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
    -- true = our user sent this; false = incoming = our user received it
    "outgoing" BOOLEAN default false,
    -- (The following 5 fields are a copies of emailPersonsRel, for speed of access.)
    -- Email address of our user that was used, either as From (outgoing) or To/CC (incoming).
    "myEmail", TEXT default null,
    "fromEmail" TEXT default null,
    "fromName" TEXT default null,
    -- First To: of this email
    "firstToEmail" TEXT default null,
    "firstToName" TEXT default null,
    -- RFC822 header Subject:
    "subject" TEXT not null,
    -- plaintext content of the email body. May be converted or post-processed.
    "plaintext" TEXT default null,
    -- HTML content of the email body. May be converted or post-processed.
    "html" TEXT default null,
    FOREIGN KEY (parentMsgID)
      REFERENCES email (id)
      ON DELETE SET NULL
  );
  -- Email folders, e.g. Inbox, sent, and user-custom folders
  CREATE TABLE "folder" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
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
    FOREIGN KEY (accountID)
      REFERENCES emailAccount (id)
      ON DELETE CASCADE
  );
  -- Which email is in which folder. Emails can be in multiple folders at once.
  -- n:n table for emails to folders
  CREATE TABLE "emailFolderRel" (
    "folderID" INTEGER not null,
    "emailID" INTEGER not null,
    -- IMAP UID number. This is relative to the folder.
    -- See also folder.uidvalidity
    -- <https://www.rfc-editor.org/rfc/rfc3501#section-2.3.1.1>
    "uid" INTEGER default null,
    FOREIGN KEY (folderID)
      REFERENCES folder (id)
      ON DELETE CASCADE,
    FOREIGN KEY (emailID)
      REFERENCES email (id)
      ON DELETE CASCADE
  );
  -- The email account of our user
  CREATE TABLE "emailAccount" (
    -- Same ID as in the preferences file
    "id" INTEGER PRIMARY KEY,
    "emailAddress" TEXT not null,
    "name" TEXT not null,
    -- "imap", "pop3", "jmap", "ews", "owa", "activesync"
    "type" TEXT not null,
    "hostname" TEXT default null,
    "port" INTEGER default null,
    "url" TEXT default null,
    "username" TEXT default null,
    "passwordButter" TEXT default null
  );
`;
