import { notifyChangedProperty, Observable } from '../util/Observable';
import { sanitize } from '../../../lib/util/sanitizeDatatypes';

export class StreetAddress extends Observable {
  @notifyChangedProperty
  street: string | null;
  @notifyChangedProperty
  city: string | null;
  @notifyChangedProperty
  postalCode: string | null;
  @notifyChangedProperty
  state: string | null;
  @notifyChangedProperty
  country: string | null;
  /** C/O, Apartment number, door code, etc. */
  @notifyChangedProperty
  instructions: string | null;

  constructor(jsonStr?: string) {
    super();
    if (jsonStr) {
      this.fromString(jsonStr);
    }
  }

  toString(): string {
    if (!(this.instructions || this.street || this.city || this.postalCode || this.state || this.country)) {
      return "";
    }
    return JSON.stringify(this.toJSON(), null, 2);
  }
  fromString(val: string) {
    this.fromJSON(JSON.parse(val));
  }

  fromJSON(json: any) {
    this.instructions = sanitize.string(json.instructions, null) ?? null;
    this.street = sanitize.string(json.street, null) ?? null;
    this.city = sanitize.string(json.city, null) ?? null;
    this.postalCode = sanitize.string(json.postalCode, null) ?? null;
    this.state = sanitize.string(json.state, null) ?? null;
    this.country = sanitize.string(json.country, null) ?? null;
  }
  toJSON() {
    return {
      instructions: this.instructions,
      street: this.street,
      city: this.city,
      postalCode: this.postalCode,
      state: this.state,
      country: this.country,
    };
  }
}
