import sql from "../../../../lib/rs-sqlite/index";

export const contactsDatabaseSchema = sql`
  CREATE TABLE "addressbook" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "protocol" TEXT not null
  );

  --- Persons in the personal address books
  CREATE TABLE "person" (
    "id" INTEGER PRIMARY KEY,
    "addressbookID" INTEGER default null,
    -- Protocol-specific ID
    "pID" ANY default null,
    "name" TEXT not null,
    "firstName" TEXT,
    "lastName" TEXT,
    -- URL
    "picture" TEXT default null,
    "notes" TEXT default null,
    "popularity" INTEGER default null,
    FOREIGN KEY (addressbookID)
      REFERENCES addressbook (id)
      ON DELETE SET NULL
  );

  --- Way to contact a person in the personal address book
  CREATE TABLE "personContact" (
    "personID" INTEGER not null,
    -- 1 = email address, 2 = chat account, 3 = phone number, 4 = street address
    "type" INTEGER not null,
    -- Email address, phone number, etc.
    "value" TEXT not null,
    -- "phone", "fax", "email", "matrix", "xmpp", ...
    "protocol" TEXT default null,
    -- "work", "private", "mobile", user-custom values
    "purpose" TEXT default null,
    -- Order of preference.
    -- Lower is more preferred.
    -- Number across all contact methods. Preference value should be unique per person.
    "preference" INTEGER default 0,
    -- UNIQUE("personID", "value", "protocol", "purpose"),
    FOREIGN KEY (personID)
      REFERENCES person (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_personContact_value ON personContact (value);
  CREATE INDEX index_personContact_personID ON personContact (personID);

  --- Groups in the personal address books
  CREATE TABLE "group" (
    "id" INTEGER PRIMARY KEY,
    "addressbookID" INTEGER default null,
    -- Protocol-specific ID
    "pID" ANY default null,
    "name" TEXT not null,
    "description" TEXT default null,
    FOREIGN KEY (addressbookID)
      REFERENCES addressbook (id)
      ON DELETE SET NULL
  );

  --- Who is in the group
  CREATE TABLE "groupMember" (
    "groupID" INTEGER not null,
    "personID" INTEGER not null,
    FOREIGN KEY (groupID)
      REFERENCES "group" (id)
      ON DELETE CASCADE,
    FOREIGN KEY (personID)
      REFERENCES person (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_groupMember_groupID ON groupMember (groupID);
  CREATE INDEX index_groupMember_personID ON groupMember (personID);
`;
