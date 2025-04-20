import sql from "../../../../../lib/rs-sqlite/index";

export const accountsDatabaseSchema = sql`
  -- The account of our user
  -- Can be an email account, chat account, remote calendar, local calendar,
  -- address book, meet account, file sharing account, etc.
  -- Most data is stored in JSON. The data in the columns must match the JSON data.
  -- Each data-type-specific database also has a dummy entry for the account,
  -- but the data here is authorative. It will sync from here to the other DBs.
  CREATE TABLE "account" (
    -- Not important. Will differ from the other DB files.
    "id" INTEGER PRIMARY KEY,
    -- Same ID as in the other DB files
    "idStr" TEXT not null UNIQUE,
    -- e.g. 1 = mail or 2 = chat or calendar etc.
    -- AccountType in SQLAccount
    "type" INTEGER not null,
    -- e.g. "imap" or "jmap-calendar" etc.
    -- Must fit to type"
    "protocol" TEXT not null,
    -- Account.mainAccount
    "mainAccountID" integer default null,

    "configJSON" TEXT default null,
    FOREIGN KEY (mainAccountID)
      REFERENCES account (id)
      ON DELETE CASCADE
  );
`;
