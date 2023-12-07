import { VideoConfMeeting } from "./VideoConfMeeting";
import { Person, ContactEntry } from "../Abstract/Person";
import { Group } from "../Abstract/Group";
import { ChatAccount } from "../Chat/Account";
import { Chat } from "../Chat/Chat";
import { MatrixAccount } from "../Chat/Matrix/MatrixAccount";
import { MatrixVideoConf } from "./MatrixVideoConf";
import { appGlobal } from "../app";

export async function startVideoCall(to: Person | Group): Promise<VideoConfMeeting> {
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

function getExistingChat(person: Contact): { chat: Chat, account: ChatAccount } | null {
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
  let entries = to.chatAccounts.sortBy(entry => entry.preferred);
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
        .sortBy(contact => contact.preferred)
        .map(contact => contact.value)
        .values()
        .first)
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
  return contact.purpose.toLowerCase() == "matrix";
}

export async function startAudioCall(to: Contact): Promise<VideoConfMeeting> {
  throw new Error("Not yet implemented. Try a video call.");
}
