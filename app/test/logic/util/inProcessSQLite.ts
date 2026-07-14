import type { Query, Database } from "../../../../lib/rs-sqlite";
// Using Node's built-in SQLite in-process, instead of the backend's via JPC
import { DatabaseSync } from "node:sqlite";

/** In-process implementation of the rs-sqlite `Database` interface,
 * as returned by `appGlobal.remoteApp.getSQLiteDatabase()`, for tests.
 * Usage:
 * ```ts
 * appGlobal.remoteApp = {
 *   getSQLiteDatabase: (filename: string) =>
 *     new InProcessSQLiteDatabase(path.join(tempDir, filename)),
 * };
 * ``` */
export class InProcessSQLiteDatabase {
  db: DatabaseSync;

  constructor(filepath: string) {
    this.db = new DatabaseSync(filepath);
  }

  protected source(query: Query): string {
    return query.sourceParts.join("?");
  }

  protected parameters(query: Query): any[] {
    // JPC serializes undefined as null. node:sqlite rejects undefined.
    return query.parameters.map(p => p === undefined ? null : p);
  }

  async migrate(...migrations: (Query | ((database: Database) => void | Promise<void>))[]): Promise<this> {
    // Always starts on a fresh test database, so no versioning needed
    for (let migration of migrations) {
      if (typeof (migration) == "function") {
        await migration(this as any as Database);
      } else {
        this.db.exec(this.source(migration));
      }
    }
    return this;
  }

  execute(query: Query): this {
    this.db.exec(this.source(query));
    return this;
  }

  run(query: Query): any {
    return this.db.prepare(this.source(query)).run(...this.parameters(query));
  }

  get<Type>(query: Query): Type | undefined {
    return this.db.prepare(this.source(query)).get(...this.parameters(query)) as Type | undefined;
  }

  all<Type>(query: Query): Type[] {
    return this.db.prepare(this.source(query)).all(...this.parameters(query)) as Type[];
  }

  pragma<Type>(source: string): Type {
    return this.db.prepare("PRAGMA " + source).all() as Type;
  }

  close() {
    this.db.close();
  }
}
