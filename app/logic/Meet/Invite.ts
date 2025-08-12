import { PersonUID } from "../../logic/Abstract/PersonUID";
import { VideoConfMeeting } from "./VideoConfMeeting";
import { findAllIdentities, type MailIdentity } from "../../logic/Mail/MailIdentity";
import { MailAccount } from "../../logic/Mail/MailAccount";
import { getDomainForEmailAddress } from "../../logic/util/netUtil";
import { appGlobal } from "../../logic/app";
import { assert, type URLString } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";

export async function invitePerson(person: PersonUID, meeting: VideoConfMeeting) {
  let invitationURL = await meeting.createInvitationURL(person.name);
  assert(person.emailAddress, gt`You don't have an email address for ${person.name}. You can copy the invitation link and send it in another way.`);
  await invitePersonByEmail(person, invitationURL, meeting);
}

async function invitePersonByEmail(person: PersonUID, invitationURL: URLString, meeting: VideoConfMeeting) {
  let from = getMailIdentity(person, meeting);
  let email = from.newEMailFrom();
  email.to.add(person);

  // TODO Configurable template
  email.subject = gt`Meeting invitation for an ongoing meeting`;
  email.html = `<body>
    <p>${gt`${from.realname} is inviting you to a meeting that is running right now:`}</p>
    <p>
    <p><a href="${invitationURL}" class="online-meeting"><strong>${gt`Please join the meeting`}</strong></a></p>
    <p>
    <p>${from.realname}
    </body>`;

  await from.account.send(email);
}

function getMailIdentity(person: PersonUID, meeting: VideoConfMeeting): MailIdentity {
  let mainAccount = meeting.account?.mainAccount;
  if (mainAccount instanceof MailAccount) {
    return mainAccount.identities.first;
  }
  for (let identity of findAllIdentities()) {
    if (getDomainForEmailAddress(person.emailAddress) ==
      getDomainForEmailAddress(identity.emailAddress)) {
      return identity;
    }
  }
  let identity = appGlobal.emailAccounts.first.identities.first;
  assert(identity, gt`Please set up an email account to send the invitation from`);
  return identity;
}
