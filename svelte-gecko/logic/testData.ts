import { AppGlobal } from './app';
import { ChatAccount } from './Chat/Account';
import { ChatMessage } from './Chat/Message';
import { ChatPerson } from './Chat/Person';
import { faker } from '@faker-js/faker';
import { ContactEntry } from './Abstract/Person';
import { Chat } from './Chat/Chat';
import { VideoConfMeeting } from './Meet/VideoConfMeeting';
import { Directory, File } from './Files/File';
import { Calendar } from './Calendar/Calendar';
import { Event } from './Calendar/Event';

export async function getTestObjects(): Promise<AppGlobal> {
  let appGlobal = new AppGlobal();

  /* Chat */
  let chatAccount = new ChatAccount();
  chatAccount.name = "Test chat 1";
  appGlobal.chatAccounts.add(chatAccount);

  for (let i = 1; i < 50; i++) {
    let person = new ChatPerson();
    person.id = "p-c-" + i;
    person.firstName = faker.name.firstName();
    person.lastName = faker.name.lastName();
    person.name = person.firstName + " " + person.lastName;
    person.emailAddresses.add(new ContactEntry(faker.internet.email(person.firstName, person.lastName), "work"));
    person.emailAddresses.add(new ContactEntry(faker.internet.email(person.firstName, person.lastName), "home"));
    person.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-170-### ####'), "mobile"));
    person.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-###-######'), "work"));
    person.chatAccount.add(new ContactEntry(person.phoneNumbers.first.value, "WhatsApp"));
    person.chatAccount.add(new ContactEntry(person.emailAddresses.first.value, "Teams"));
    person.groups.add(new ContactEntry(faker.company.name(), "Mustang"));
    person.groups.add(new ContactEntry(faker.company.name(), "WhatsApp"));
    person.groups.add(new ContactEntry(faker.company.name(), "Teams"));
    let address = faker.address.streetAddress() + "\n" + faker.address.zipCode() + " " + faker.address.cityName();
    person.streetAddresses.add(new ContactEntry(address, "home"));
    person.picture = faker.image.avatar();

    let chat = new Chat();
    chatAccount.chats.set(person, chat);
    chatAccount.persons.add(person);
    appGlobal.persons.add(person);

    let messages = chat.messages;
    for (let i = 1; i < 300; i++) {
      let msg = new ChatMessage();
      msg.contact = person;
      msg.outgoing = Math.random() < 0.4;
      msg.sent = faker.date.past(0.1);
      msg.received = new Date(msg.sent.getMilliseconds() + 500);
      msg.text = faker.hacker.phrase();
      msg.html = msg.text;
      messages.add(msg);
    }
    person.lastMessage = messages.sortBy(msg => msg.sent).reverse().first;
  }

  /* Calendar */
  let calendar = new Calendar();
  appGlobal.calendars.add(calendar);
  for (let i = 1; i < 50; i++) {
    let event = new Event();
    event.startTime = i < 5 ? faker.date.recent() : faker.date.future(0.2);
    let endTimeMax = new Date(event.startTime);
    endTimeMax.setMinutes(endTimeMax.getMinutes() + 120);
    event.endTime = faker.date.between(event.startTime, endTimeMax);
    event.title = faker.random.words();
    event.descriptionText = faker.random.words() + "\n" + faker.random.words();
    event.descriptionHTML = event.descriptionText.replace("\n", "<br>");
    event.location = faker.datatype.boolean ? faker.address.streetAddress() : faker.address.nearbyGPSCoordinate().join(", ");
    calendar.events.add(event);
  }

  /* Files */
  let sharedDirectory = new Directory();
  sharedDirectory.name = "shared";
  sharedDirectory.id = "/shared";
  appGlobal.files.add(sharedDirectory);
  for (let person of appGlobal.persons) {
    let personDirectory = new Directory();
    personDirectory.name = person.name;
    personDirectory.sentToFrom = person;
    personDirectory.lastMod = faker.date.past();
    personDirectory.setParent(sharedDirectory);
    appGlobal.files.add(personDirectory);
    let dirCount = 2 + Math.random() * 10;
    for (let i = 0; i < dirCount; i++) {
      fakeDir(personDirectory).sentToFrom = person;
    }
  }

  return appGlobal;
}

function fakeDir(parentDir: Directory): Directory {
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

function fakeFile(parentDir: Directory): File {
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

/*
let testMessages: Collection<EMail> = new ArrayColl<EMail>();
for (let i = 1; i < 10000; i++) {
  let msg = new EMail();
  msg.msgID = i + '';
  msg.date = new Date();
  msg.subject = "Talk about " + i;
  msg.authorRealname = "Some guy " + i;
  msg.authorEmailAddress = "guy" + i + "@example.com";
  msg.recipientEmailAddress = "me@example.org";
  msg.recipientRealname = "Ben";
  msg.contentType = "text/plain";
  msg._bodyPlaintext = "Some message " + i;
  testMessages.add(msg);
}
*/

