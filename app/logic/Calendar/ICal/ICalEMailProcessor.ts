import ICalParser from "./ICalParser";
import { Event } from "../Event";
import type { EMail } from "../../Mail/EMail";
import { InvitationMessage } from "../Invitation/InvitationStatus";
import { EMailProcessor, ProcessingStartOn } from "../../Mail/EMailProccessor";
import { convertICalParserToEvent } from "./ICalToEvent";

export class ICalEMailProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail, postalMIME: any) {
    let invitationBlob = email.attachments.find(a => a.mimeType == "text/calendar")?.content;
    if (!invitationBlob) {
      return;
    }
    let invitationStr = await invitationBlob.text();
    let ics = new ICalParser(invitationStr);
    email.invitationMessage = iTIPMethod(ics);
    let event = new Event();
    let isEvent = convertICalParserToEvent(ics, event);
    if (!isEvent) {
      return;
    }
    if (email.hasHTML) {
      event.rawHTMLDangerous = email.rawHTMLDangerous;
    }
    email.event = event;

    if (email.invitationMessage == InvitationMessage.ParticipantReply ||
        email.invitationMessage == InvitationMessage.CancelledEvent) {
      let foundEventInCalendars = email.getUpdateCalendars();
      for (let calendar of foundEventInCalendars) {
        let incomingInvitation = calendar.getIncomingInvitationForEMail(email);
        await incomingInvitation.updateFromOtherInvitationMessage();
      }
    }
  }
}

/* Find the iTIP method from a parsed vcalendar part */
function iTIPMethod(ics: any): InvitationMessage {
  switch (ics.containers.vcalendar?.[0].entries.method?.[0].value) {
  case "CANCEL":
    return InvitationMessage.CancelledEvent;
  case "REQUEST":
    return InvitationMessage.Invitation;
  case "REPLY":
    return InvitationMessage.ParticipantReply;
  }
  return InvitationMessage.None;
}
