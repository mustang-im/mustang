import sql from "../../../../../lib/rs-sqlite/index";

export const accountsDatabaseSchema = sql`
  -- The account of our user
  -- Can be an email account, chat account, remote calendar, local calendar,
  -- address book, meet account, file sharing account, etc.
  -- Most data is stored in JSON. The data in the columns must match the JSON data.
  -- Each data-type-specific database also has a dummy entry for the account,
  -- but the data here is authorative. It will sync from here to the other DBs.
  CREATE TABLE "account" (
    -- Same ID as in the other DB files
    "idStr" TEXT not null UNIQUE,
    -- e.g. 1 = mail or 2 = chat or calendar etc.
    -- AccountType in SQLAccount
    "type" INTEGER not null,
    -- e.g. "imap" or "jmap-calendar" etc.
    -- Must fit to type"
    "protocol" TEXT not null,
    -- Account.mainAccount
    -- References account.idStr
    "mainAccountIDStr" TEXT default null,
    -- Most account parameters are stored in here.
    -- This includes the URL or hostname, port,
    -- auth method, username, password etc.,
    -- as well as protocol-specific config options.
    "json" TEXT default null
    -- TODO dependent account might be saved before the main account
    -- FOREIGN KEY (mainAccountIDStr)
    --   REFERENCES account (idStr)
    --   ON DELETE CASCADE
  );
`;
