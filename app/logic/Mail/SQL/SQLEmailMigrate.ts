import sql from "../../../../lib/rs-sqlite";

// <copied from="createDatabase.ts">
// Runs or fails silently and doesn't increment user_version
export const createFolderIDDateSentIndex = sql`
  CREATE INDEX index_email_folderID_dateSent
  ON email (folderID, dateSent DESC);
`;
