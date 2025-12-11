import { MeetingState, VideoConfMeeting } from "./VideoConfMeeting";
import { Person, ContactEntry } from "../Abstract/Person";
import { Group } from "../Abstract/Group";
import { MeetingParticipant } from "./Participant";
import type { ChatAccount } from "../Chat/ChatAccount";
import type { Chat } from "../Chat/Chat";
import type { M3Account } from "./M3/M3Account";
import { M3Conf } from "./M3/M3Conf";
import type { LiveKitAccount } from "./LiveKit/LiveKitAccount";
import { MatrixAccount } from "../Chat/Matrix/MatrixAccount";
import { MatrixVideoConf } from "./Matrix/MatrixVideoConf";
import { appGlobal } from "../app";
import { UserError, type URLString, assert } from "../util/util";
import { gt } from "../../l10n/l10n";

export async function startVideoCall(to: Person | Group): Promise<VideoConfMeeting> {
  // TODO test code
  let call = new VideoConfMeeting();
  let callee = new MeetingParticipant();
  callee.name = to.name;
  callee.picture = to.picture;
  call.participants.add(callee);
  call.state = MeetingState.OutgoingCallConfirm;
  appGlobal.meetings.add(call);
  return call;

  let haveChat = getExistingChat(to);
  if (!haveChat) {
    if (to instanceof Person) {
      haveChat = await createNewPersonChat(to);
    } else if (to instanceof Group) {
      haveChat = await createNewGroupChat(to);
    }
  }
  if (!haveChat) {
    throw new Error("No suitable contact methods found for " + to.name);
  }
  let conf: VideoConfMeeting | null = null;
  if (haveChat.account instanceof MatrixAccount) {
    conf = await MatrixVideoConf.call(haveChat.chat, haveChat.account.client);
  }
  if (!conf) {
    throw new Error("Call not possible for this type of contact");
  }
  appGlobal.meetings.add(conf);
  return conf;
}

function getExistingChat(person: Person | Group): { chat: Chat, account: ChatAccount } | null {
  for (let account of appGlobal.chatAccounts) {
    if (!accountSuitableForCall(account)) {
      continue;
    }
    for (let chat of account.chats) {
      if (chat.contact == person) {
        return { chat, account };
      }
    }
  }
  return null;
}

function accountSuitableForCall(account: ChatAccount) {
  return account instanceof MatrixAccount;
}

async function createNewPersonChat(to: Person): Promise<{ chat: Chat, account: ChatAccount } | null> {
  // Check available contact methods, and pick the preferred one for this person
  let iHaveMatrix = haveAccountType(MatrixAccount);
  console.log("User has a Matrix account");
  let entries = to.chatAccounts.sortBy(entry => entry.preference);
  for (let entry of entries) {
    if (iHaveMatrix && entryIsMatrix(entry)) {
      return createNewMatrixChat(to, entry.value);
    }
  }
  return null;
}

async function createNewGroupChat(to: Group): Promise<{ chat: Chat, account: ChatAccount } | null> {
  // TODO implement creating a group chat to an arbitrary list of people
  let iHaveMatrix = haveAccountType(MatrixAccount);
  let theyAllHaveMatrix =
    to.participants.contents.every(person =>
      person.chatAccounts.some(entry => entryIsMatrix(entry)));
  if (iHaveMatrix && theyAllHaveMatrix) {
    let matrixIDs = to.participants.map(person =>
      person.chatAccounts.filter(entry => entryIsMatrix(entry))
        .sortBy(contact => contact.preference)
        .first.value)
      .values().contents;
    return createNewMatrixGroupChat(to, matrixIDs);
  }
  return null;
}

async function createNewMatrixChat(to: Person, matrixID: string): Promise<{ chat: Chat, account: MatrixAccount } | null> {
  throw new Error("Not implemented: Create Matrix chat room to person");
  // TODO Create Matrix chat room with that person
  return null;
}

async function createNewMatrixGroupChat(to: Group, matrixIDs: string[]): Promise<{ chat: Chat, account: MatrixAccount } | null> {
  throw new Error("Not implemented: Create Matrix chat room to group");
  // TODO Create Matrix chat room with those persons
  return null;
}

function haveAccountType(type: typeof ChatAccount): boolean {
  return appGlobal.chatAccounts.some(account => account instanceof type);
}

function entryIsMatrix(contact: ContactEntry) {
  return contact.purpose?.toLowerCase() == "matrix";
}

export async function startAudioCall(to: Person | Group): Promise<VideoConfMeeting> {
  throw new Error("Not yet implemented. Try a video call.");
}

/**
 * The user received invitation URL out-of-band (using other communication methods)
 * from the conference organizer.
 * The URL should contain both the room and the ticket to permit joining.
 * @returns meeting
 *   `meeting.join()` was already called. You still need to `meeting.start()`.
 * @throws if the URL is not supported
 */
export async function joinConferenceByURL(url: URLString): Promise<VideoConfMeeting> {
  assert(url, "Need URL");
  let urlParsed: URL;
  try {
    urlParsed = new URL(url);
  } catch (ex) {
    throw new UserError(gt`This is not a meeting URL`);
  }
  let account = appGlobal.meetAccounts.find(acc => acc.isMeetingURL(urlParsed));
  if (!account) {
    // TODO Open `url` in embedded browser window, as fallback
    throw new UserError(gt`This meeting URL is not supported`);
  }
  let conf = account.newMeeting();
  await conf.join(url);
  return conf;
}
