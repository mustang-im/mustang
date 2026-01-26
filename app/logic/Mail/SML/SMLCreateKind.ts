import { SMLData } from "./SMLData";
import { TSMLActionStatus, type TSMLBookMe, type TSMLMeetingTimePoll, type TSMLPerson, type TSMLChooseAction, type TSMLSimplePoll, type TSMLThing } from "./TSML";
import type { MailIdentity } from "../MailIdentity";
import { assert } from "../../util/util";

export function createPoll(identity: MailIdentity): SMLData {
  let end = new Date();
  end.setDate(end.getDate() + 14);
  return createSML({
    "@type": "SimplePoll",
    name: "",
    options: [
      /*{
        "@type": "Answer",
        name: "",
      } as TSMLThing,*/
    ],
    potentialReaction: [
      {
        "@type": "ChooseAction",
        actionOption: null,
        target: [
          `mailto:${identity.emailAddress}`,
        ],
      } as TSMLChooseAction<TSMLThing>,
    ],
    selectMultiple: false,
    reactions: [],
    organizer: {
      name: identity.realname,
      email: identity.emailAddress,
    } as TSMLPerson,
    status: TSMLActionStatus.InProgress,
    ends: end,
  } as TSMLSimplePoll<TSMLThing>);
}

export function createMeetingTimePoll(identity: MailIdentity): SMLData {
  let end = new Date();
  end.setDate(end.getDate() + 14);
  return createSML({
    "@type": "MeetingTimePoll",
    name: "",
    options: [],
    duration: 60,
    potentialReaction: [
      {
        "@type": "ChooseAction",
        actionOption: null,
        target: [
          `mailto:${identity.emailAddress}`,
        ],
      } as TSMLChooseAction<Date>,
    ],
    selectMultiple: true,
    reactions: [],
    organizer: {
      name: identity.realname,
      email: identity.emailAddress,
    } as TSMLPerson,
    status: TSMLActionStatus.InProgress,
    ends: end,
  } as TSMLMeetingTimePoll);
}

export function createBookMe(identity: MailIdentity): SMLData {
  let end = new Date();
  end.setDate(end.getDate() + 14);
  return createSML({
    "@type": "BookMe",
    options: [],
    duration: 60,
    potentialReaction: [
      {
        "@type": "ChooseAction",
        actionOption: null,
        target: [
          `mailto:${identity.emailAddress}`,
        ],
      } as TSMLChooseAction<Date>,
    ],
    selectMultiple: false,
    reactions: [],
    organizer: {
      name: identity.realname,
      email: identity.emailAddress,
    } as TSMLPerson,
    status: TSMLActionStatus.InProgress,
    ends: end,
  } as TSMLBookMe);
}

function createSML(json: TSMLThing): SMLData {
  let type = json["@type"];
  assert(type, "Must set @type");
  let context = "https://schema.org"
  json["@context"] = context;
  let sml = new SMLData();
  sml.sml = json as any;
  sml.type = type;
  sml.context = context;
  return sml;
}
