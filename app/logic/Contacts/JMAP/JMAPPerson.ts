import { Person } from '../../Abstract/Person';
import { JSContact } from './JSContact';
import type { TJMAPContact } from './TJSContact';
import type { TID, TJMAPChangeResponse } from '../../Mail/JMAP/TJMAPGeneric';
import type { JMAPAddressbook } from './JMAPAddressbook';
import { checkChangeError } from '../../Mail/JMAP/JMAPError';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { assert } from '../../util/util';

export class JMAPPerson extends Person {
  declare addressbook: JMAPAddressbook | null;
  original: TJMAPContact;
  uid: string;
  jmapID: TID;

  get account() {
    return this.addressbook.account;
  }

  fromJMAP(jmap: TJMAPContact) {
    JSContact.toPerson(jmap, this);
    this.jmapID = sanitize.alphanumdash(jmap.id);
    this.original = jmap;
  }

  async saveToServer() {
    let isNew = !this.original;
    let jscontact = this.original ?? {} as TJMAPContact;
    JSContact.fromPerson(this, jscontact);
    jscontact.addressBookIds ??= {};
    jscontact.addressBookIds[this.addressbook.jmapID] = true;
    assert(this.id, "ContactBase ctor should set this");

    let results = await this.account.makeSingleCall("ContactCard/set", {
      accountId: this.account.accountID,
      [isNew ? "create" : "update"]: {
        [isNew ? this.id : this.jmapID]: jscontact,
      },
    }) as TJMAPChangeResponse<TJMAPContact>;
    console.log("server responded", results);
    checkChangeError(results);

    if (isNew) {
      this.original = jscontact;
      this.jmapID = this.original.id = sanitize.alphanumdash(results.created[this.id].id);
      await this.saveLocally();
    }
  }

  async deleteFromServer() {
    await this.account.makeSingleCall("ContactCard/set", {
      accountId: this.account.accountID,
      destroy: [this.jmapID],
    });
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.original = sanitize.json(json.original, {}); // as object, not string
    this.jmapID = sanitize.alphanumdash(json.jmapID, null);
    this.uid = sanitize.nonemptystring(json.uid, null);
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.original = this.original;
    json.jmapID = this.jmapID;
    json.uid = this.uid;
    return json;
  }
}
