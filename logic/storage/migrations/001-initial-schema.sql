-- Up
CREATE TABLE email (
  folder INTEGER not null,
  msgID TEXT not null,
  -- metadata
  firstFrom INTEGER not null,
  firstTo INTEGER not null,
  meTo INTEGER default null,
  dateSent TEXT not null,
  dateReceived TEXT not null,
  subject TEXT not null,
  PRIMARY KEY(folder, msgID);
  CONSTRAINT email_fk_folder FOREIGN KEY (folder)
    REFERENCES folder (id) ON UPDATE CASCADE ON DELETE CASCADE);
);
-- Separated out to reduce the size of the primary table.
CREATE TABLE emailBody (
  id INTEGER PRIMARY KEY not null,
  -- contains the primary body of the email.
  -- Uses plaintext part or the down-converted HTML.
  -- Does not contain any quotes, nor attachments.
  plaintext TEXT not null,
);
CREATE TABLE folder (
  id INTEGER autoincrement PRIMARY KEY not null,
  accountID TEXT not null,
  fullPath TEXT not null,
  name TEXT not null,
);
CREATE TABLE person (
  id INTEGER autoincrement PRIMARY KEY not null,
  emailAddress TEXT not null,
  name TEXT default null,
);
CREATE UNIQUE INDEX person_idx_emailAddress ON person(emailAddress);

-- Down
DROP TABLE email;
DROP TABLE folder;
