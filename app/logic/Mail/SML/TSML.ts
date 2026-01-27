import type { URLString } from "../../util/util";

export interface TSMLThing {
  /** Name of the class.
   * Without `TSML`, without `https://schema.org/`.
   * E.g. `@type: "Foo"` = `https://schema.org/Foo` */
  "@type": string;
  /** UUID */
  "@id"?: string;
  name?: string;
  description?: string;
  url?: URLString;
}

export interface TSMLPerson extends TSMLThing {
  /** name: full name of the person */
  email: string;
}

export interface TSMLAction extends TSMLThing {
  actionStatus?: TSMLActionStatus;
  /** The one choosing, i.e. our user */
  agent?: TSMLPerson;
  /** What the action responds to */
  object?: TSMLThing | TSMLThing[];
  /** Where to send the action, as SML.
   * May be a `https:` URL which allows a PUT with SML as body,
   * or a `mailto:` URL where to send the SML email. */
  target?: URLString[],
};

export enum TSMLActionStatus {
  InProgress = "ActiveActionStatus",
  Completed = "CompletedActionStatus",
  Failed = "FailedActionStatus",
  TODO = "PotentialActionStatus",
}

export interface TSMLChooseAction<Action extends TSMLThing | Date> extends TSMLAction {
  /** Which selection our user chose */
  actionOption: Action | null;
};

/** Asks that the recipient of the request does something.
 * The response is typically an `Action` */
export interface TSMLRequest extends TSMLThing {
  /** Who started and controls this request */
  organizer: TSMLPerson;
  /** The desired reactions from the respondents.
   * The respondent typically picks one or multiple from these. */
  potentialReaction: TSMLAction[];
  /** The answers from the respondents.
   * Note: They may be in a separate object on the same level as the poll */
  reactions: TSMLAction[];
}

/** Asking a question. The responents need to choose
 * one or multiple from the predefined answers. */
export interface TSMLSimplePoll<PollOption extends TSMLThing | Date> extends TSMLRequest {
  /** name: The question to answer with this choice */
  /** description: Further details about the question */
  /** false = respondent can only pick one of the options
   *  true = respondent can choose multiple one of the options */
  selectMultiple: boolean,
  /** ActiveActionStatus = open for votes
   * CompletedActionStatus = no new or changed votes are accepted anymore */
  status: TSMLActionStatus;
  /** When the poll will be closed and not accept new or changed votes anymore
   * Note: not @update.expires, which is when the data will be removed. */
  ends: Date;
  /** Which choices the respondents have. */
  options: PollOption[];
  /** potentialAction: must contain a `ChooseAction` */
  /** reactions: must be `ChooseAction`s */
}

/** When should the meeting happen? The responents need to choose
 * one or multiple from the predefined time slots.
 *
 * All `options` must be `DateTime`s in schema.org = ISO 8601 datetime strings in JSON =
 * `Date` objects in JavaScript. */
export interface TSMLTimePoll extends TSMLSimplePoll<Date> {
  /** in minutes, integer only */
  duration: number;
}

/** When should the meeting of multiple people happen?
 * The responents need to choose one or better multiple from the predefined time slots.
 * This allows the organizer to pick a time that suits the group best. */
export interface TSMLMeetingTimePoll extends TSMLTimePoll {
  selectMultiple: true,
}

/** Type of `TSMLMeetingTimePoll.reactions[n].object` */
export interface TSMLMeetingTimeVote extends TSMLThing {
  time: Date;
  preference: TSMLMeetingTimePreference;
}

export enum TSMLMeetingTimePreference {
  /** This time is OK */
  Accept = "accept",
  /** Cannot attend at this time */
  Reject = "reject",
  /** Not sure yet */
  Maybe = "maybe",
  /** Cannot attend at this time */
  Bad = "bad",
}

/** When should the meeting happen? The responent needs to choose
 * one from the predefined time slots.
 * The organizer should be free at any of the proposed time slots,
 * at least at the time of asking.
 * Once the respondent picks a time slot and responds, the meeting should be set
 * immediately at that time slot,
 * unless the organizer was booked in the meantime between question and answer.
 * TODO Define that final commitment exchange. iCal or SML? */
export interface TSMLBookMe extends TSMLTimePoll {
  selectMultiple: false,
  state: TSMLBookMeState,
}

/** The states that the booking process can be in.
 * The states are in a strict sequence and are listed in the order that they must happen. */
export enum TSMLBookMeState {
  /** Before: We have received suggestions from the sender when he is free.
   * In this state: The user selects one of the options. */
  Select = "select",
  /** Before: The user selected one of the options
   * In this state: The user needs to re-affirm us that he wants to
   *   book that particular time option */
  UserConfirm = "user-confirm",
  /** Before: The user has confirmed that he wants this time option
   * In this state: We are waiting for the sender to confirm that this option is still available
   *   and that he booked that appointment.
   *   TODO: Should this come in form of SML or in form of an classic iCal iMIP? */
  UserConfirmed = "user-confirmed",
  /** Before: The sender has sent us confirmation that one of the time options
   * is also firmly booked on his side.
   * In this state: The appointment is firm on both sides. */
  BothConfirmed = "confirmed",
}
