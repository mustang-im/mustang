import { MeetAccount } from "./MeetAccount";

export class PhoneAccount extends MeetAccount {
  readonly protocol: string = "phone";
  /** Country phone prefix, e.g. 1 for USA+Kanada, 49 for Germany, 33 for France etc.
   * Used to complete phone numbers in national notation.
   * User setting. */
  countryCode = 49;

  canAudio = true;
  canScreenShare = false;
  canMultipleParticipants = false;
  canCreateURL = false;
}
