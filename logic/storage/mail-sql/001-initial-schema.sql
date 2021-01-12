-- Up
CREATE TABLE email (
  folder INTEGER not null,
  UID INTEGER default null,
  msgID TEXT not null,
  -- metadata
  parentMsgID TEXT default null,
  subject TEXT not null,
  firstFrom INTEGER not null,
  firstTo INTEGER not null,
  meTo INTEGER default null,
  dateSent INTEGER not null,
  dateReceived INTEGER not null,
  PRIMARY KEY (folder, msgID),
  FOREIGN KEY (folder)
    REFERENCES folder (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
-- Separated out to reduce the size of the primary table.
CREATE TABLE emailBody (
  folder INTEGER not null,
  UID INTEGER not null,
  -- contains the primary body of the email.
  -- Uses plaintext part or the down-converted HTML.
  -- Does not contain any quotes, nor attachments.
  plaintext TEXT not null,
  html TEXT default null,
  PRIMARY KEY (folder, UID)
);
CREATE TABLE folder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accountID TEXT not null,
  fullPath TEXT not null,
  name TEXT not null,
  UNIQUE (accountID, fullPath)
);
CREATE TABLE person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emailAddress TEXT not null,
  name TEXT default null
);
CREATE UNIQUE INDEX person_idx_emailAddress ON person (emailAddress);

-- Down
DROP TABLE email;
DROP TABLE folder;
