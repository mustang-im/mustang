import { VideoConfMeeting } from "./VideoConfMeeting";
import type { PhoneAccount } from "./PhoneAccount";
import { MeetingParticipant } from "./Participant";
import { AbstractFunction, assert } from "../util/util";
import { appGlobal } from "../app";
import { gt } from "../../l10n/l10n";

export class PhoneCall extends VideoConfMeeting {
  declare account: PhoneAccount;
  /** The other party of the phone call.
   * In international number format, normalized by `getInternationalPhoneNumber()` */
  remotePhoneNumber: string;
  hasVideo = false;

  /** Send numbers to other end */
  async sendDTMF(digit: string) {
    throw new AbstractFunction();
  }

  protected findRemoteParticipant(): MeetingParticipant | null {
    let person = appGlobal.persons.find(person => !!person.phoneNumbers.find(ce => PhoneCall.matchPhoneNumber(ce.value, this.remotePhoneNumber, this.account.countryCode)));
    if (!person) {
      return null;
    }
    let puid = new MeetingParticipant(this.remotePhoneNumber, person.name);
    puid.person = person;
    return puid;
  }

  protected setRemoteParticipant() {
    let participant = this.findRemoteParticipant();
    if (participant && this.participants.isEmpty) {
      this.participants.add(participant);
    }
  }

  /** Check whether phone number a is the same as b.
   *
   * @param a phone number to test.
   *  Will be normalized with `countryCodeForA`
   * @param b phone number that you test against.
   *  Must already be normalized with `getInternationalPhoneNumber()`
   * @param countryCodeForA `this.account.countryCode`
   * @returns The two phone numbers are the same
   */
  static matchPhoneNumber(a: string, b: string, countryCodeForA: number): boolean {
    if (!a || !b) {
      return false;
    }
    if (a === b) {
      return true;
    }
    try {
      a = this.getInternationalPhoneNumber(a, countryCodeForA);
    } catch (ex) {
      return false;
    }
    return a == b;
  }

  /** Throws when number cannot be parsed.
    * @returns e.g. "+49-123-000000" */
  static getInternationalPhoneNumber(phoneNumber: string, myCountryCode: number): string {
    phoneNumber = phoneNumber.replaceAll(/[^0-9\+]/g, ""); // Leave only numbers and leading +
    assert(phoneNumber, gt`Need phone number`);
    if (phoneNumber.startsWith("+")) {
      // OK
    } else if (phoneNumber.startsWith("00")) {
      phoneNumber = "+" + phoneNumber.substring(2);
    } else if (phoneNumber.startsWith("0")) {
      phoneNumber = "+" + myCountryCode + phoneNumber.substring(1);
    } else if (myCountryCode == 1 && phoneNumber.startsWith("011")) {
      phoneNumber = "+" + phoneNumber.substring(3);
    } else if (myCountryCode == 1 && phoneNumber.length == 10) {
      phoneNumber = "+1" + phoneNumber;
    } else {
      let format = `0611-000000 = +${myCountryCode}-611-000000 = 00${myCountryCode}-611-000000`;
      if (myCountryCode == 1) {
        let local = `650-555-0000 = +1-650-555-0000`;
        let intl = `+49-555-000000 = 0049-555-000000 = 011-49-555-000000`;
        format = gt`${local} or international ${intl} *=> US or international phone number format`;
      }
      throw new Error(gt`Phone number not recognized. Supported formats: ${format}`);
    }
    return phoneNumber;
  }
}
