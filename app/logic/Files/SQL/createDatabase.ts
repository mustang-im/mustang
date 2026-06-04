import sql from "../../../../lib/rs-sqlite/index";

export const filesDatabaseSchema = sql`
  -- File sharing account
  -- Most properties are in the accounts DB
  CREATE TABLE "fileSharingAccount" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "protocol" TEXT not null
  );

  -- A directory inside a file-sharing account
  CREATE TABLE "directory" (
    "id" INTEGER PRIMARY KEY,
    "accountID" INTEGER not null,
    -- Parent directory. null for the account root
    "parentID" INTEGER default null,
    -- Leaf name
    "name" TEXT not null,
    -- root-relative path. For directories, always ends with "/"
    "path" TEXT not null,
    -- Last modification. Unix seconds since epoch.
    "lastMod" INTEGER not null default (unixepoch()),
    -- Protocol-specific. WebDAV: etag, JMAP: state. Can be string or integer.
    "syncState" ANY default null,
    "json" TEXT default null,
    UNIQUE("accountID", "path"),
    FOREIGN KEY (accountID)
      REFERENCES fileSharingAccount (id)
      ON DELETE CASCADE,
    FOREIGN KEY (parentID)
      REFERENCES directory (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_directory_accountID ON directory (accountID);
  CREATE INDEX index_directory_parentID ON directory (parentID);

  -- A file inside a directory. File contents are NOT stored here — only metadata.
  -- Bytes are fetched on demand via the protocol-specific download().
  CREATE TABLE "file" (
    "id" INTEGER PRIMARY KEY,
    "directoryID" INTEGER not null,
    -- Leaf name with extension
    "name" TEXT not null,
    -- root-relative path
    "path" TEXT not null,
    -- local file path, part after /files/cloud/
    "pathLocal" TEXT default null,
    "size" INTEGER not null default 0,
    "mimetype" TEXT default null,
    -- Last modification. Unix seconds since epoch.
    "lastMod" INTEGER not null default (unixepoch()),
    -- Protocol-specific. WebDAV: etag, JMAP: state. Can be string or integer.
    "syncState" ANY default null,
    -- Server URL to GET the file contents, but needs auth
    "serverURL" TEXT default null,
    "json" TEXT default null,
    UNIQUE("directoryID", "path"),
    FOREIGN KEY (directoryID)
      REFERENCES directory (id)
      ON DELETE CASCADE
  );
  CREATE INDEX index_file_directoryID ON file (directoryID);
`;
