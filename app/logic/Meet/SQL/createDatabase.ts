import sql from "../../../../lib/rs-sqlite/index";

export const meetDatabaseSchema = sql`
  CREATE TABLE "meetAccount" (
    "id" INTEGER PRIMARY KEY,
    "idStr" TEXT UNIQUE,
    "name" TEXT UNIQUE,
    "protocol" TEXT not null,
    "url" TEXT default null,
    "username" TEXT default null,
    "password" TEXT default null,
    "authMethod" INTEGER default 0,
    "workspace" TEXT default null
  );
`;
