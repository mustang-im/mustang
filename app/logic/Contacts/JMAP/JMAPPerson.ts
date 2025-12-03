import { Person, ContactEntry } from '../../Abstract/Person';
import type { JMAPAddressbook } from './JMAPAddressbook';
import { JSContact } from './JSContact';
import type { TJSContact, TPrivateOrWork } from './TJSContact';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';

export class JMAPPerson extends Person {
  declare addressbook: JMAPAddressbook | null;
  original: TJSContact;

  get uid() {
    return this.id;
  }
  set uid(val) {
    this.id = val;
  }
  get account() {
    return this.addressbook.account;
  }

  fromJMAP(jmap: TJSContact) {
    this.uid = sanitize.nonemptystring(jmap.uid);
    JSContact.toPerson(jmap, this);
  }

  async saveToServer() {
    let jscontact = this.original ?? {} as TJSContact;
    JSContact.fromPerson(this, jscontact);
    await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      update: {
        [this.uid]: jscontact,
      },
    });
  }

  async deleteFromServer() {
    await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      destroy: [this.uid],
    });
  }

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.original = sanitize.json(json.original); // as object, not string
  }
  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.original = this.original;
    return json;
  }
}
