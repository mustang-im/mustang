// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { chatDatabaseSchema } from "./createDatabase";

let chatDatabase: Database;

// <copied from="Mail/SQL/SQLDatabase.ts">

export async function getDatabase(): Promise<Database> {
  if (chatDatabase) {
    return chatDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  chatDatabase = await getDatabase("chat.db");
  await chatDatabase.migrate(chatDatabaseSchema);
  await chatDatabase.pragma('foreign_keys = true');
  await chatDatabase.pragma('journal_mode = DELETE');
  return chatDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<Database> {
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  chatDatabase = await getDatabase("test-chat.db");
  await deleteDatabase();
  await chatDatabase.migrate(chatDatabaseSchema);
  await chatDatabase.pragma('foreign_keys = true');
  return chatDatabase;
}

async function deleteDatabase(): Promise<void> {
  let tables = await chatDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    await chatDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await chatDatabase.pragma('user_version = 0');
}
