import { AceBase, type DataReference } from "acebase";

export class AceBaseHandle {
  private _db: AceBase;

  async init(filename: string, options: any) {
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

  async set(refPath: string, value: any): Promise<DataReference<any>> {
    return this._db.ref(refPath).set(value);
  }

  async push(refPath: string, value: any): Promise<string> {
    let ref = await this._db.ref(refPath).push(value);
    return ref.key;
  }

  async update(refPath: string, value: any): Promise<DataReference<any>> {
    return this._db.ref(refPath).update(value);
  }

  async remove(refPath: string): Promise<DataReference<any>> {
    return this._db.ref(refPath).remove();
  }

  async query(refPath: string, filters: { column: string, op: any, value: string }[], getOptions: Object): Promise<any[]> {
    let q = this._db.query(refPath);
    for (let filter of filters) {
      q = q.filter(filter.column, filter.op, filter.value);
    }
    let snapshots = await q.get(getOptions);
    return snapshots.getValues();
  }

  /** Use this only if there is no other appropriate method on this class */
  ref(refPath: string): DataReference {
    return this._db.ref(refPath);
  }
}
