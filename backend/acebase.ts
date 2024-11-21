import { AceBase } from "acebase";

export class AceBaseHandle {
  private _db: AceBase;

  async init(filename: string, options: Record<string, any>) {
    options.logLevel = "warn";
    this._db = new AceBase(filename, options);
    await this._db.ready();
  }

  async get(refPath: string): Promise<any> {
    let snapshot = await this._db.ref(refPath).get();
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  }

  async set(refPath: string, value: any): Promise<void> {
    await this._db.ref(refPath).set(value);
  }

  async push(refPath: string, value: any): Promise<string> {
    let ref = await this._db.ref(refPath).push(value);
    return ref.key;
  }

  async update(refPath: string, value: any): Promise<void> {
    await this._db.ref(refPath).update(value);
  }

  async remove(refPath: string): Promise<void> {
    await this._db.ref(refPath).remove();
  }

  async query(refPath: string, filters: { column: string, op: any, value: string }[], getOptions: Object): Promise<any[]> {
    let q = this._db.query(refPath);
    for (let filter of filters) {
      q = q.filter(filter.column, filter.op, filter.value);
    }
    let snapshots = await q.get(getOptions);
    return snapshots.getValues();
  }

  async forEach(refPath: string, include: any, eachCallback: (ref: string, value: any) => void): Promise<void> {
    await this._db.ref(refPath).forEach(include, snapshot => {
      eachCallback(snapshot.key, snapshot.val());
    });
  }

  /**
   * For each with a query options
   * @param refPath 
   * @param query 
   * Options:
   * - filters?: `{ column: string, op: any, value: string }[]`
   * - sort?: `{ column: string, ascending?: boolean }[]`, ascending is true by default
   * - limit?
   * - startWith?
   * @param include 
   * @param eachCallback 
   */
  async forEachQuery(refPath: string, query: QueryOptions, include: any, eachCallback: (ref: string, value: any) => void): Promise<void> {
    let q = this._db.query(refPath);
    let cols = new Set<string>();
    if (query.filters) {
      for (let filter of query.filters) {
        q = q.filter(filter.column, filter.op, filter.value);
        cols.add(filter.column);
      }
    }
    if (query.sorts) {
      for (let sort of query.sorts) {
        q = q.sort(sort.column, !!sort.ascending);
        cols.add(sort.column);
      }
    }
    if (query.limit) {
      q = q.take(query.limit);
    }
    if (query.startWith) {
      q = q.skip(query.startWith);
    }
    let colsArray = Array.from(cols);
    await Promise.all(colsArray.map(c => this._db.indexes.create(refPath, c)));
    await q.forEach(include, snapshot => {
      eachCallback(snapshot.key, snapshot.val());
    });
  }
}

export interface QueryOptions {
  filters?: { column: string, op: any, value: any }[];
  sorts?: { column: string, ascending?: boolean }[];
  limit?: number;
  startWith?: number;
}