import { appGlobal } from './app';
import { MailAccount } from './Mail/MailAccount';
import { EMail } from './Mail/EMail';
import { ChatAccount } from './Chat/ChatAccount';
import { UserChatMessage } from './Chat/Message';
import { ChatPerson } from './Chat/Person';
import { faker } from '@faker-js/faker';
import { ContactEntry, Person } from './Abstract/Person';
import { Chat } from './Chat/Chat';
import { Directory, File } from './Files/File';
import { Calendar } from './Calendar/Calendar';
import { Event } from './Calendar/Event';
import { ArrayColl, type Collection } from 'svelte-collections';
import { Folder, SpecialFolder } from './Mail/Folder';

export async function getTestObjects(): Promise<void> {
  appGlobal.me = fakeChatPerson();
  appGlobal.persons.addAll(fakePersons());
  appGlobal.emailAccounts.add(fakeMailAccount(appGlobal.persons, appGlobal.me));
  appGlobal.chatAccounts.add(fakeChatAccount(appGlobal.persons, appGlobal.me));
  appGlobal.calendars.add(fakeCalendar(appGlobal.persons));
  appGlobal.files.addAll(fakeSharedDir(appGlobal.persons));
}

export function fakePersons(count = 50): Collection<Person> {
  let persons = new ArrayColl<Person>();
  for (let i = 1; i <= count; i++) {
    persons.add(fakeChatPerson());
  }
  return persons;
}

export function fakeChatPerson(): Person {
  let person = new ChatPerson();
  person.id = faker.datatype.uuid();
  person.firstName = faker.name.firstName();
  person.lastName = faker.name.lastName();
  person.name = person.firstName + " " + person.lastName;
  person.emailAddresses.add(new ContactEntry(faker.internet.email(person.firstName, person.lastName), "work"));
  person.emailAddresses.add(new ContactEntry(faker.internet.email(person.firstName, person.lastName), "home"));
  person.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-170-### ####'), "mobile"));
  person.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-###-######'), "work"));
  person.chatAccounts.add(new ContactEntry(person.phoneNumbers.first.value, "WhatsApp"));
  person.chatAccounts.add(new ContactEntry(person.emailAddresses.first.value, "Teams"));
  person.groups.add(new ContactEntry(faker.company.name(), "Mustang"));
  person.groups.add(new ContactEntry(faker.company.name(), "WhatsApp"));
  person.groups.add(new ContactEntry(faker.company.name(), "Teams"));
  let address = faker.address.streetAddress() + "\n" +
    faker.address.zipCode() + " " +
    faker.address.cityName();
  person.streetAddresses.add(new ContactEntry(address, "home"));
  person.picture = faker.image.avatar();
  person.company = faker.company.name();
  person.department = faker.commerce.department();
  person.position = faker.company.bsNoun();
  return person;
}

export function fakeMailAccount(persons: Collection<Person>, me: Person, msgCount = 300): MailAccount {
  let account = new MailAccount();
  account.name = "Yahoo";
  account.emailAddress = me.emailAddresses.first.value;
  account.userRealname = me.name;
  account.id = faker.datatype.uuid();
  me.emailAddresses.add(new ContactEntry(account.emailAddress, "Primary"));

  for (let name of ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam']) {
    let folder = new Folder(account);
    folder.name = name;
    folder.specialFolder = folder.name.toLowerCase() as SpecialFolder;
    account.rootFolders.push(folder);
  }
  account.inbox = account.rootFolders.first;

  let lastReadTime = new Date();
  lastReadTime.setHours(lastReadTime.getHours() - 1);
  let emailNr = 0;
  for (let person of persons) {
    for (let i = 1; i <= msgCount; i++) {
      emailNr++;
      let folder: Folder;
      if (Math.random() < 0.99) {
        folder = account.inbox;
      } else {
        let folderIndex = Math.floor(Math.random() * account.rootFolders.length);
        folder = account.rootFolders.getIndex(folderIndex) ?? account.inbox;
      }
      let msg = new EMail(folder);
      msg.id = emailNr + '';
      msg.sent = faker.date.past(0.1);
      msg.received = new Date(msg.sent.getTime() + 500);
      msg.isRead = msg.received < lastReadTime;
      msg.subject = faker.hacker.phrase().replace("!", "").replace(/,.*/, "");
      msg.outgoing = Math.random() < 0.4;
      msg.contact = person;
      let meEmail = account.emailAddress;
      msg.authorEmailAddress = msg.outgoing ? meEmail : person.emailAddresses.first.value;
      msg.to.add(msg.outgoing ? person : me);
      for (let i = Math.floor(Math.random() * 3); i > 0; i--) {
        msg.to.add(fakeMailPerson());
      }
      for (let i = Math.floor(Math.random() * 10); i > 0; i--) {
        msg.cc.add(fakeMailPerson());
      }
      if (Math.random() < 0.2) {
        msg.bcc.add(fakeMailPerson());
      }
      let paragraphs = [];
      for (let iP = Math.floor(Math.random() * 7) + 1; iP > 0; iP--) {
        let paragraph = faker.hacker.phrase().replace("!", ".");
        for (let iS = Math.floor(Math.random() * 5); iS > 0; iS--) {
          paragraph += " " + faker.hacker.phrase().replace("!", ".");
        }
        paragraphs.push(paragraph);
      }
      msg.text = paragraphs.join("\n\n");
      if (Math.random() > 0.3) {
        msg.html = `<p>${paragraphs.join("</p><p>")}</p>`;
      }
      folder.messages.add(msg);
      account.messages.set(person, msg);
    }
  }
  return account;
}

export function fakeMailPerson(): Person {
  let person = new Person();
  person.id = faker.datatype.uuid();
  person.name = faker.name.fullName();
  person.emailAddresses.add(new ContactEntry(faker.internet.email(), "Other"));
  return person;
}

export function fakeChatAccount(persons: Collection<Person>, me: Person, msgCount = 300): ChatAccount {
  let chatAccount = new ChatAccount();
  chatAccount.name = "Test chat 1";
  chatAccount.userRealname = me.name;

  for (let person of persons) {
    let chat = new Chat();
    chat.contact = person;
    chatAccount.chats.set(person, chat);
    chatAccount.persons.add(person);

    let messages = chat.messages;
    let lastTime = faker.date.past(0.1);
    for (let i = 1; i <= msgCount; i++) {
      let msg = new UserChatMessage();
      msg.to = chat;
      msg.contact = chat.contact;
      msg.outgoing = Math.random() < 0.4;
      if (Math.random() < 0.5) {
        msg.sent = faker.date.future(0.000001, lastTime); // followup
      } else {
        msg.sent = faker.date.past(0.1);
      }
      msg.received = new Date(msg.sent.getTime() + 500);
      msg.text = faker.hacker.phrase().replace("!", "");
      msg.html = msg.text;
      messages.add(msg);
      lastTime = msg.sent;
    }
    chat.lastMessage = messages.sortBy(msg => msg.sent).last;
  }
  return chatAccount;
}

export function fakeCalendar(persons: Collection<Person>, eventCount = 50): Calendar {
  let calendar = new Calendar();
  calendar.name = faker.company.name();
  for (let i = 1; i <= eventCount; i++) {
    let event = new Event();
    event.startTime = i < 5 ? faker.date.recent() : faker.date.future(0.2);
    let endTimeMax = new Date(event.startTime);
    endTimeMax.setMinutes(endTimeMax.getMinutes() + 120);
    event.endTime = faker.date.between(event.startTime, endTimeMax);
    event.title = faker.random.words();
    event.descriptionText = faker.random.words() + "\n" + faker.random.words();
    event.descriptionHTML = event.descriptionText.replace("\n", "<br>");
    event.location = faker.datatype.boolean ? faker.address.streetAddress() : faker.address.nearbyGPSCoordinate().join(", ");
    let participantsCount = Math.random() * 5;
    for (let i = 1; i < participantsCount; i++) {
      event.participants.add(persons.getIndex(Math.floor(Math.random() * persons.length)));
    }
    calendar.events.add(event);
  }
  return calendar;
}

export function fakeSharedDir(persons: Collection<Person>): Collection<Directory> {
  let directories = new ArrayColl<Directory>();
  let sharedDirectory = new Directory();
  sharedDirectory.name = "shared";
  sharedDirectory.id = "/shared";
  for (let person of persons) {
    let personDirectory = new Directory();
    personDirectory.name = person.name;
    personDirectory.sentToFrom = person;
    personDirectory.lastMod = faker.date.past();
    personDirectory.setParent(sharedDirectory);
    directories.add(personDirectory);
    let dirCount = 2 + Math.random() * 10;
    for (let i = 0; i < dirCount; i++) {
      fakeDir(personDirectory).sentToFrom = person;
    }
  }
  return directories;
}

export function fakeDir(parentDir: Directory): Directory {
  let directory = new Directory();
  directory.name = faker.helpers.unique(() => faker.system.fileName({ extensionCount: 0 }));
  directory.lastMod = faker.date.past();
  directory.setParent(parentDir);
  let dirCount = Math.random() * 6;
  dirCount -= 4;
  for (let i = 0; i < dirCount; i++) {
    fakeDir(directory);
  }
  let fileCount = 2 + Math.random() * 20;
  for (let i = 0; i < fileCount; i++) {
    fakeFile(directory);
  }
  return directory;
}

export function fakeFile(parentDir: Directory): File {
  let file = new File();
  file.name = faker.helpers.unique(() => faker.system.commonFileName());
  let parts = file.name.split(".");
  file.ext = parts.pop();
  file.nameWithoutExt = parts.join(".");
  file.length = faker.datatype.number(40000000);
  file.lastMod = faker.date.past();
  file.setParent(parentDir);
  return file;
}
