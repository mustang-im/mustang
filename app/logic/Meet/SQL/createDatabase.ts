import sql from "../../../../lib/rs-sqlite/index";

export const meetDatabaseSchema = sql`
  CREATE TABLE "meetAccount" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT not null UNIQUE,
    "name" TEXT not null,
    "protocol" TEXT not null,
    "url" TEXT default null,
    "username" TEXT default null,
    "authMethod" INTEGER default 0,
    "configJSON" TEXT default null,
    "workspace" TEXT default null,
    "syncState" ANY default null
  );
`;
