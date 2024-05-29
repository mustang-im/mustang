import sql from "../../../../../lib/rs-sqlite/index";

export const mailSourceDatabaseSchema = sql`
  -- Email addresses, as found in received emails.
  -- They are not necessarily in the personal address book.
  CREATE TABLE "emailMIME" (
    "id" INTEGER PRIMARY KEY,
    -- FOREIGN KEY to mail.db email.id
    "emailID" INTEGER not null,
    -- RFC822 header
    "messageID" TEXT default null,
    "mime" ANY not null
  );
`;
