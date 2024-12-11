// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { appGlobal } from "../../app";
import sql, { type Database } from "../../../../lib/rs-sqlite/index";
import { calendarDatabaseSchema } from "./createDatabase";

let calendarDatabase: Database;

// <copied from="Mail/SQL/SQLDatabase.ts">

export async function getDatabase(): Promise<Database> {
  if (calendarDatabase) {
    return calendarDatabase;
  }
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  calendarDatabase = await getDatabase("calendar.db");
  await calendarDatabase.migrate(calendarDatabaseSchema);
  await calendarDatabase.pragma('foreign_keys = true');
  await calendarDatabase.pragma('journal_mode = DELETE');
  return calendarDatabase;
}

/**
 * Creates a new database for testing only, in a different file,
 * and lets getDatabase() from now on return that test database,
 * until the process is shut down.
 */
export async function makeTestDatabase(): Promise<Database> {
  const getDatabase = appGlobal.remoteApp.getSQLiteDatabase;
  calendarDatabase = await getDatabase("test-calendar.db");
  await deleteDatabase();
  await calendarDatabase.migrate(calendarDatabaseSchema);
  await calendarDatabase.pragma('foreign_keys = true');
  return calendarDatabase;
}

async function deleteDatabase(): Promise<void> {
  let tables = await calendarDatabase.all(sql`SELECT name FROM sqlite_schema WHERE type='table'`) as any[];
  for (let row of tables) {
    let table = row.name;
    await calendarDatabase.execute(sql`DROP TABLE IF EXISTS ${table};`);
  }
  await calendarDatabase.pragma('user_version = 0');
}
