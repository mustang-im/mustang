import { appGlobal } from './app';
import { MailAccount } from './Mail/MailAccount';
import { Folder, SpecialFolder } from './Mail/Folder';
import { ChatAccount } from './Chat/ChatAccount';
import { MeetAccount } from './Meet/MeetAccount';
import { DeliveryStatus, UserChatMessage } from './Chat/Message';
import { PersonUID } from './Abstract/PersonUID';
import { ContactEntry, Person } from './Abstract/Person';
import { Group } from './Abstract/Group';
import { StreetAddress } from './Contacts/StreetAddress';
import { Chat } from './Chat/Chat';
import { FileSharingAccount } from './Files/FileSharingAccount';
import type { File } from './Files/File';
import { Directory } from './Files/Directory';
import { Calendar } from './Calendar/Calendar';
import { Participant as CalendarParticipant } from './Calendar/Participant';
import { InvitationResponse } from './Calendar/Invitation/InvitationStatus';
import { Addressbook } from './Contacts/Addressbook';
import { Event } from './Calendar/Event';
import { EMail } from './Mail/EMail';
import { ComposeActions } from './Mail/ComposeActions';
import { MailIdentity } from './Mail/MailIdentity';
import { FakeMeetAccount } from './Meet/FakeMeeting';
import { DummyMailStorage } from './Mail/Store/DummyMailStorage';
import { DummyChatStorage } from './Chat/SQL/DummyChatStorage';
import { DummyCalendarStorage } from './Calendar/SQL/DummyCalendarStorage';
import { DummyAddressbookStorage } from './Contacts/SQL/DummyAddressbookStorage';
import { notifyChangedProperty } from './util/Observable';
import { ArrayColl, type Collection } from 'svelte-collections';
import { faker } from '@faker-js/faker';

export const realMailAccounts = new ArrayColl<MailAccount>();
export const realChatAccounts = new ArrayColl<ChatAccount>();
export const realMeetAccounts = new ArrayColl<MeetAccount>();
export const realAddressbooks = new ArrayColl<Addressbook>();
export const realCalendars = new ArrayColl<Calendar>();

export async function testDataOn() {
  realMailAccounts.replaceAll(appGlobal.emailAccounts);
  realChatAccounts.replaceAll(appGlobal.chatAccounts);
  realMeetAccounts.replaceAll(appGlobal.meetAccounts);
  realAddressbooks.replaceAll(appGlobal.addressbooks);
  realCalendars.replaceAll(appGlobal.calendars);

  appGlobal.me ??= new FakeChatPerson();
  let addressbook = new FakeAddressbook();
  let persons = fakePersons(10, addressbook);
  appGlobal.addressbooks.replaceAll([ addressbook ]);
  appGlobal.emailAccounts.replaceAll([ new FakeMailAccount(persons, appGlobal.me) ]);
  appGlobal.chatAccounts.replaceAll([ new FakeChatAccount(persons, appGlobal.me) ]);
  appGlobal.calendars.replaceAll([ new FakeCalendar(persons) ]);
  appGlobal.meetAccounts.replaceAll([ new FakeMeetAccount() ]);
  appGlobal.fileSharingAccounts.replaceAll([ new FakeFileSharingAccount() ]);
  await appGlobal.emailAccounts.first.login(false);
  await appGlobal.chatAccounts.first.login(false);
}

export async function testDataOff() {
  appGlobal.emailAccounts.replaceAll(realMailAccounts);
  appGlobal.chatAccounts.replaceAll(realChatAccounts);
  appGlobal.meetAccounts.replaceAll(realMeetAccounts);
  appGlobal.addressbooks.replaceAll(realAddressbooks);
  appGlobal.calendars.replaceAll(realCalendars);
  realMailAccounts.clear();
  realChatAccounts.clear();
  realMeetAccounts.clear();
  realAddressbooks.clear();
  realCalendars.clear();
}

export async function addTestDataToGlobal(): Promise<void> {
  appGlobal.me = new FakeChatPerson();
  let addressbook = new FakeAddressbook();
  let persons = fakePersons(20, addressbook);
  appGlobal.addressbooks.add(addressbook);
  appGlobal.emailAccounts.add(new FakeMailAccount(persons, appGlobal.me));
  appGlobal.chatAccounts.add(new FakeChatAccount(persons, appGlobal.me));
  appGlobal.calendars.add(new FakeCalendar(persons));
  appGlobal.meetAccounts.add(new FakeMeetAccount());
  appGlobal.fileSharingAccounts.add(new FakeFileSharingAccount());
  await appGlobal.emailAccounts.first.login(false);
  await appGlobal.chatAccounts.first.login(false);
}

export class FakeAddressbook extends Addressbook {
  constructor() {
    super();
    this.name = faker.company.name();
    this.url = faker.internet.url();
    this.username = faker.internet.username();
    this.storage = new DummyAddressbookStorage();
  }
}

export function fakePersons(count = 50, addressbook: Addressbook): Collection<Person> {
  let persons = new ArrayColl<Person>();
  for (let i = 1; i <= count; i++) {
    let person = new FakeChatPerson();
    person.addressbook = addressbook;
    persons.add(person);
  }
  if (addressbook) {
    addressbook.persons.addAll(persons);
  }
  return persons;
}

export function fakeGroups(groupCount = 10, maxMemberCount = 20, addressbook: Addressbook): Collection<Group> {
  let groups = new ArrayColl<Group>();
  let persons = addressbook.persons;
  for (let iP = 1; iP <= groupCount; iP++) {
    let group = new Group();
    group.name = unique(faker.person.jobTitle);
    group.addressbook = addressbook;
    let memberCount = 2 + Math.floor(Math.random() * (maxMemberCount - 2));
    for (let iG = 1; iG <= memberCount; iG++) {
      let person = persons.getIndex(Math.floor(Math.random() * persons.length));
      if (group.participants.has(person)) {
        continue;
      }
      group.participants.add(person);
    }
    groups.add(group);
  }
  if (addressbook) {
    addressbook.groups.addAll(groups);
  }
  return groups;
}

export class FakeChatPerson extends Person {
  constructor() {
    super();
    this.id = faker.string.uuid();
    let male = Math.random() < 0.5;
    this.firstName = faker.person.firstName(male ? "male" : "female");
    this.lastName = faker.person.lastName();
    this.name = this.firstName + " " + this.lastName;
    this.emailAddresses.add(new ContactEntry(faker.internet.email(this.firstName, this.lastName).toLowerCase(), "work"));
    this.emailAddresses.add(new ContactEntry(faker.internet.email(this.firstName, this.lastName).toLowerCase(), "home"));
    this.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-170-### ####'), "mobile"));
    this.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-###-######'), "work"));
    this.chatAccounts.add(new ContactEntry(this.phoneNumbers.first.value, "WhatsApp"));
    this.chatAccounts.add(new ContactEntry(this.emailAddresses.first.value, "Teams"));
    this.groups.add(new ContactEntry(faker.company.name(), "Mustang"));
    this.groups.add(new ContactEntry(faker.company.name(), "WhatsApp"));
    this.groups.add(new ContactEntry(faker.company.name(), "Teams"));
    let address = new StreetAddress();
    address.street = faker.location.streetAddress();
    address.postalCode = faker.location.zipCode();
    address.city = faker.location.city();
    this.streetAddresses.add(new ContactEntry(address.toString(), "home"));
    this.picture = avatar(male);
    this.company = faker.company.name();
    this.department = faker.commerce.department();
    this.position = faker.person.jobTitle();
  }
}

export class FakeMailAccount extends MailAccount {
  msgCount: number;
  persons: Collection<Person>;
  meUID: PersonUID;
  @notifyChangedProperty
  _isLoggedIn = false;
  constructor(persons: Collection<Person>, me: Person, msgCount = 300) {
    super();
    this.name = "Yahoo Test";
    this.emailAddress = me.emailAddresses.first.value ?? "You";
    this.realname = me.name;
    this.username = this.emailAddress;
    this.password = faker.internet.password();
    this.hostname = "imap." + faker.internet.domainName();
    this.port = 993;
    this.tls = 2;
    this.identities.add(new FakeMailIdentity(this));
    this.storage = new DummyMailStorage();

    me.emailAddresses.add(new ContactEntry(this.emailAddress, "Primary"));
    this.meUID = new PersonUID(this.emailAddress, this.realname);
    this.persons = persons;
    this.msgCount = msgCount;
  }
  async login() {
    await this.listFolders();
    this._isLoggedIn = true;
  }
  get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }
  async listFolders(): Promise<void> {
    if (this.rootFolders.hasItems) {
      return;
    }
    for (let name of ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam']) {
      let folder = this.newFolder();
      folder.setFakeName(name);
      this.rootFolders.push(folder);
    }
    let inbox = this.rootFolders.first as FakeFolder;
    inbox.specialFolder = SpecialFolder.Inbox;
    await inbox.listMessages();
  }
  newFolder(): FakeFolder {
    return new FakeFolder(this);
  }

  async send(email: EMail): Promise<void> {
    let sentFolder = this.findFolder(acc => acc.specialFolder == SpecialFolder.Sent)!;
    sentFolder.addMessage(email);
  }
}

class FakeFolder extends Folder {
  declare account: FakeMailAccount;
  setFakeName(name: string) {
    this.name = name;
    this.id = name.toLowerCase();
    this.specialFolder = this.name.toLowerCase() as SpecialFolder;
  }
  async listMessages(): Promise<Collection<EMail>> {
    if (this.messages.hasItems) {
      return this.messages;
    }
    let messages = new ArrayColl<FakeEMail>();
    let lastReadTime = new Date();
    lastReadTime.setHours(lastReadTime.getHours() - 1);
    let emailNr = 0;
    for (let person of this.account.persons) {
      let pUID = PersonUID.fromPerson(person);
      let msgCount = this.account.msgCount * (this.specialFolder == SpecialFolder.Inbox
          ? 0.99
          : 0.01);
      this.countTotal = msgCount;
      for (let i = 1; i <= msgCount; i++) {
        emailNr++;
        let msg = this.newEMail();
        msg.setFake(person, pUID, this.account.meUID, lastReadTime, emailNr);
        messages.add(msg);
      }
    }
    this.messages.addAll(messages.sortBy(msg => msg.received));
    return this.messages;
  }
  async getNewMessages(): Promise<Collection<EMail>> {
    return this.messages;
  }
  newEMail(): FakeEMail {
    return new FakeEMail(this);
  }
  async addMessage(message: EMail) {
    this.messages.add(message);
  }
  async moveMessagesHere(messages: Collection<EMail>) {
    let sourceFolder = messages.first.folder;
    sourceFolder.messages.removeAll(messages);
    this.messages.addAll(messages);
  }
  async copyMessagesHere(messages: Collection<EMail>) {
    this.messages.addAll(messages);
  }
}

class FakeEMail extends EMail {
  setFake(person: Person, pUID: PersonUID, meUID: PersonUID, lastReadTime: Date, emailNr: number) {
    this.needToLoadBody = false;
    this.id = emailNr + '@' + this.folder.account.emailAddress;
    this.sent = faker.date.past({ years: 0.1 });
    this.received = new Date(this.sent.getTime() + 500);
    this.size = Math.ceil(Math.random() * 2048 + 200);
    this.isRead = this.received < lastReadTime;
    this.subject = faker.hacker.phrase().replace("!", "").replace(/,.*/, "");
    this.outgoing = Math.random() < 0.4;
    this.contact = person;
    this.from = this.outgoing ? meUID : pUID;
    this.to.add(this.outgoing ? pUID : meUID);
    for (let i = Math.floor(Math.random() * 3); i > 0; i--) {
      this.to.add(new FakeMailPerson());
    }
    for (let i = Math.floor(Math.random() * 10); i > 0; i--) {
      this.cc.add(new FakeMailPerson());
    }
    if (Math.random() < 0.2) {
      this.bcc.add(new FakeMailPerson());
    }
    let paragraphs: string[] = [];
    for (let iP = Math.floor(Math.random() * 7) + 1; iP > 0; iP--) {
      let paragraph = faker.hacker.phrase().replace("!", ".");
      for (let iS = Math.floor(Math.random() * 5); iS > 0; iS--) {
        paragraph += " " + faker.hacker.phrase().replace("!", ".");
      }
      paragraphs.push(paragraph);
    }
    this.text = paragraphs.join("\n\n");
    if (Math.random() > 0.3) {
      this.html = `<p>${paragraphs.join("</p><p>")}</p>`;
    }
  }
  get compose() {
    return new FakeComposeActions(this);
  }
  async download() {}
}

class FakeComposeActions extends ComposeActions {
  declare email: FakeEMail;
  async saveAsDraft(): Promise<void> {
    this.email.sent = new Date();
    await super.saveAsDraft();
  }
  async send() {
    this.email.sent = new Date();
    await this.email.identity.account.send(this.email);
    await this.deleteDrafts();
  }
}

export class FakeMailPerson extends PersonUID {
  constructor() {
    super(faker.internet.email().toLowerCase(), faker.person.fullName());
  }
}

class FakeMailIdentity extends MailIdentity {
  constructor(account: FakeMailAccount) {
    super(account);
    this.emailAddress = account.emailAddress;
    this.realname = appGlobal.me.name;
  }
}

export class FakeChatAccount extends ChatAccount {
  me: Person;
  msgCount: number;
  constructor(persons: Collection<Person>, me: Person, msgCount = 20) {
    super();
    this.name = "Test chat 1";
    this.realname = me.name;
    this.msgCount = msgCount;
    this.me = me;
    this.persons.addAll(persons);
    this.storage = new DummyChatStorage();
  }
  async login(interactive: boolean): Promise<void> {
    await this.listChats();
  }
  async listChats(): Promise<void> {
    if (this.chats.hasItems) {
      return;
    }
    for (let person of this.persons) {
      let chat = this.newChat() as FakeChat;
      chat.id = person.id + "-" + faker.string.uuid();
      chat.contact = person;
      this.chats.set(person, chat);
    }
  }
  newChat(): FakeChat {
    return new FakeChat(this);
  }
}

class FakeChat extends Chat {
  constructor(account: FakeChatAccount) {
    super(account);
  }
  async listMembers(): Promise<void> {
  }
  async listMessages(): Promise<void> {
    if (this.messages.hasItems) {
      return;
    }
    let lastTime = faker.date.past({ years: 0.1 });
    let msgCount = (this.account as FakeChatAccount).msgCount;
    for (let i = 1; i <= msgCount; i++) {
      let msg = this.newMessage();
      msg.setFakeTime(lastTime);
      this.messages.add(msg);
      lastTime = msg.sent;
    }
    this.lastMessage = this.messages.sortBy(msg => msg.sent).last;
  }
  newMessage(): FakeChatMessage {
    return new FakeChatMessage(this);
  }

  async sendMessage(message: UserChatMessage) {
    message.deliveryStatus = DeliveryStatus.Sending;
    this.messages.push(message);
  }
}

class FakeChatMessage extends UserChatMessage {
  constructor(chat: FakeChat) {
    super(chat);
    this.id = faker.string.uuid();
    this.to = chat;
    this.contact = chat.contact;
    this.outgoing = Math.random() < 0.4;
    this.text = faker.hacker.phrase().replace("!", "");
    this.html = this.text;
  }
  setFakeTime(lastTime: Date) {
    let isFollowup = Math.random() < 0.5;
    this.sent = isFollowup
      ? faker.date.future({ years: 0.000001, refDate: lastTime })
      : faker.date.past({ years: 0.1 });
    this.received = new Date(this.sent.getTime() + 500);
  }
}

export class FakeCalendar extends Calendar {
  randomParticipants: Collection<CalendarParticipant>;
  constructor(persons: Collection<Person>, eventCount = 50) {
    super();
    this.name = faker.company.name();
    this.storage = new DummyCalendarStorage();

    this.randomParticipants = new ArrayColl(persons.contents.map(person => {
      let personUID = PersonUID.fromPerson(person);
      return new CalendarParticipant(personUID.emailAddress, personUID.name, InvitationResponse.NoResponseReceived);
    }));
    for (let i = 1; i <= eventCount; i++) {
      let event = this.newEvent();
      event.setTime(i > 5);
      this.events.add(event);
    }
  }
  newEvent(parentEvent?: FakeEvent): FakeEvent {
    return new FakeEvent(this, parentEvent);
  }
}



class FakeEvent extends Event {
  declare calendar: FakeCalendar;
  constructor(calendar: FakeCalendar, parentEvent?: FakeEvent) {
    super(calendar, parentEvent);
    this.title = faker.company.buzzPhrase();
    this.descriptionText = faker.hacker.phrase() + "\n" + faker.hacker.phrase();
    this.location = faker.datatype.boolean() ? faker.location.streetAddress() : faker.location.nearbyGPSCoordinate().join(", ");
    let participantsCount = Math.random() * 5;
    for (let i = 1; i < participantsCount; i++) {
      let participant = this.calendar.randomParticipants.getIndex(Math.floor(Math.random() * this.calendar.randomParticipants.length));
      this.participants.add(participant);
    }
  }
  setTime(future: boolean) {
    this.startTime = future
      ? faker.date.future({ years: 0.2 })
      : faker.date.recent();
    let endTimeMax = new Date(this.startTime);
    endTimeMax.setMinutes(endTimeMax.getMinutes() + 120);
    this.endTime = faker.date.between({ from: this.startTime, to: endTimeMax });
  }
}

export class FakeFileSharingAccount extends FileSharingAccount {
  constructor() {
    super();
    this.name = "Dropbox";
    let dirCount = Math.random() * 10;
    let dirs: Directory[] = [];
    for (let i = 0; i < dirCount; i++) {
      let parentDir = this.newDirectory(faker.system.fileName({ extensionCount: 0 }));
      dirs.push(fakeDir(parentDir));
    }
    this.rootDirs.addAll(dirs);
  }
}

export function fakeSharedDir(persons: Collection<Person>): Directory {
  let sharedDirectory = new Directory();
  sharedDirectory.name = "shared";
  sharedDirectory.id = "/shared";
  for (let person of persons) {
    let personDirectory = sharedDirectory.newDirectory(person.name);
    personDirectory.sentToFrom = person;
    personDirectory.lastMod = faker.date.past();
    sharedDirectory.subDirs.add(personDirectory);
    let dirCount = 2 + Math.random() * 10;
    for (let i = 0; i < dirCount; i++) {
      fakeDir(personDirectory).sentToFrom = person;
    }
  }
  return sharedDirectory;
}

export function fakeDir(parentDir: Directory): Directory {
  let name = unique(() => faker.system.fileName({ extensionCount: 0 }));
  let directory = parentDir.newDirectory(name);
  directory.lastMod = faker.date.past();
  let dirCount = Math.random() * 6;
  dirCount -= 4;
  for (let i = 0; i < dirCount; i++) {
    fakeDir(directory);
  }
  let fileCount = 2 + Math.random() * 20;
  for (let i = 0; i < fileCount; i++) {
    fakeFile(directory);
  }
  parentDir.subDirs.add(directory);
  return directory;
}

export function fakeFile(parentDir: Directory): File {
  let name = unique(faker.system.commonFileName)
  let file = parentDir.newFile(name);
  let parts = file.name.split(".");
  file.ext = parts.pop()!;
  file.nameWithoutExt = parts.join(".");
  file.size = faker.number.int({ max: 40000000 });
  file.lastMod = faker.date.past();
  parentDir.files.add(file);
  return file;
}

function avatar(male: boolean): string {
  let list = male ? avatarMan : avatarWoman;
  let i = Math.floor(Math.random() * list.length);
  let prefix = male ? "man/" : "woman/";
  return "https://test.mustang.im/avatar/" + prefix + list[i];
}

const avatarMan = ["1007306.jpeg", "10132847.jpeg", "1060374.jpeg", "10605916.png", "1148452.jpeg", "1153612.jpeg", "1164553.jpeg", "11776410.jpeg", "11903493.jpeg", "1199578.jpeg", "1266105.jpeg", "12668818.jpeg", "1283987.jpeg", "13005312.jpeg", "13082503.jpeg", "13901302.png", "1408546.png", "1409704.jpeg", "1415737.jpeg", "1447852.jpeg", "1447886.jpeg", "1448774.png", "1469188.jpeg", "148830.jpeg", "15212329.jpeg", "154396.png", "155470.png", "15730494.jpeg", "1590998.jpeg", "15928587.png", "1596691.jpeg", "1608856.jpeg", "163036.jpeg", "16672426.jpeg", "16736043.jpeg", "1705325.jpeg", "17085606.jpeg", "1718693.jpeg", "1744556.png", "176419.jpeg", "1765975.png", "17753304.png", "18314300.jpeg", "1866504.png", "18669784.jpeg", "1926501.jpeg", "19368319.jpeg", "19594891.jpeg", "19735126.jpeg", "19846079.jpeg", "19963844.png", "200952.jpeg", "20192424.png", "20206207.jpeg", "20318872.jpeg", "20322521.png", "2032482.jpeg", "21185661.jpeg", "21262500.jpeg", "219947.jpeg", "22127739.jpeg", "22627956.png", "2262876.jpeg", "231537.png", "23529819.jpeg", "2353689.jpeg", "2438862.jpeg", "2465081.jpeg", "2485510.jpeg", "2494504.jpeg", "2520515.jpeg", "25248043.png", "25254910.jpeg", "2537291.jpeg", "25408117.jpeg", "26030184.jpeg", "26626409.jpeg", "2800315.jpeg", "2810691.jpeg", "28446355.png", "28499592.jpeg", "28705622.jpeg", "29313649.jpeg", "29499608.jpeg", "2971649.jpeg", "30127611.jpeg", "30229938.png", "30399323.jpeg", "30460392.jpeg", "3063939.jpeg", "30677343.jpeg", "31185492.jpeg", "31347218.jpeg", "3145336.png", "3165749.jpeg", "31797732.jpeg", "3181172.jpeg", "32093987.jpeg", "32653158.jpeg", "3273035.jpeg", "3322672.jpeg", "33738315.jpeg", "339728.png", "34146634.jpeg", "3439129.jpeg", "345778.jpeg", "34659766.jpeg", "349588.jpeg", "3501753.jpeg", "3507654.png", "3519705.jpeg", "3533302.png", "35552279.jpeg", "35645016.jpeg", "35950317.jpeg", "3598441.jpeg", "36211023.jpeg", "3647931.png", "36781651.jpeg", "368892.jpeg", "37297137.jpeg", "3729857.jpeg", "37417399.jpeg", "3763753.jpeg", "3788658.jpeg", "38669152.jpeg", "3914942.jpeg", "39165122.jpeg", "39170898.jpeg", "3965425.jpeg", "40127247.png", "402361.jpeg", "40286512.jpeg", "40382473.png", "40527919.jpeg", "41165309.jpeg", "41960056.jpeg", "4233572.jpeg", "42551522.jpeg", "42572776.png", "4278487.jpeg", "42944484.jpeg", "43510291.png", "4352286.jpeg", "43801490.jpeg", "43880651.png", "44837206.jpeg", "4498381.png", "4517312.jpeg", "454919.jpeg", "4550971.png", "45667093.png", "45947221.png", "4617256.png", "4633793.jpeg", "46647927.jpeg", "4685982.jpeg", "46987397.jpeg", "4707100.jpeg", "4727883.png", "47327545.png", "47598818.jpeg", "481439.png", "4962436.jpeg", "49634629.jpeg", "49870567.jpeg", "50178167.jpeg", "50322402.jpeg", "51505535.jpeg", "51751504.jpeg", "51802951.jpeg", "5189416.jpeg", "51978075.png", "53487103.png", "5350492.jpeg", "53905808.jpeg", "5444009.jpeg", "54668333.jpeg", "54876675.jpeg", "55291177.jpeg", "55435564.jpeg", "55977960.png", "5655980.jpeg", "56791405.png", "57067763.png", "572889.jpeg", "5761537.jpeg", "57736073.jpeg", "59490671.png", "60098111.jpeg", "6010505.jpeg", "60179410.jpeg", "6042670.jpeg", "60814450.png", "6146023.jpeg", "6171903.jpeg", "6191448.jpeg", "6219022.jpeg", "62640804.png", "62870435.png", "63062135.jpeg", "63072867.jpeg", "63288526.png", "63515958.png", "63719340.jpeg", "648243.jpeg", "65384838.jpeg", "6595058.jpeg", "663716.jpeg", "67579351.jpeg", "67746585.jpeg", "67981150.jpeg", "6816127.png", "6825806.jpeg", "6870173.jpeg", "688876.jpeg", "68933975.jpeg", "69867634.jpeg", "70266403.jpeg", "70339890.jpeg", "71038254.jpeg", "72217414.jpeg", "72721656.jpeg", "73124805.jpeg", "73932569.jpeg", "73949958.jpeg", "74023694.jpeg", "74191399.jpeg", "74521602.jpeg", "74632296.jpeg", "7478444.jpeg", "74787191.jpeg", "74936354.jpeg", "75119388.jpeg", "7549089.jpeg", "75655495.jpeg", "75777769.jpeg", "76106688.jpeg", "76480477.jpeg", "77164771.jpeg", "78384435.jpeg", "78477393.jpeg", "78645190.jpeg", "78760838.jpeg", "789828.jpeg", "79319308.jpeg", "79472721.png", "79800673.jpeg", "798175.jpeg", "80486148.png", "81082876.jpeg", "81638203.jpeg", "81826212.jpeg", "81960951.jpeg", "82384564.jpeg", "82389041.jpeg", "82400898.jpeg", "82468.png", "82801465.jpeg", "82999753.jpeg", "83097828.jpeg", "83262947.jpeg", "8379186.jpeg", "83890302.jpeg", "83964189.jpeg", "84193980.png", "842301.jpeg", "8435880.png", "84424979.jpeg", "84799359.jpeg", "84999404.jpeg", "85060860.jpeg", "85200523.jpeg", "8589175.jpeg", "86631099.jpeg", "86780949.jpeg", "86805659.jpeg", "86990978.jpeg", "870135.jpeg", "8711218.jpeg", "87222982.jpeg", "87231735.jpeg", "8725797.jpeg", "87316472.jpeg", "87444503.png", "87758948.png", "87763791.jpeg", "87895914.jpeg", "88826962.jpeg", "89142861.jpeg", "89179737.jpeg", "89412137.png", "89521448.jpeg", "89710723.jpeg", "91370356.jpeg", "91489285.jpeg", "91946387.png", "92167962.jpeg", "92554662.jpeg", "92585486.jpeg", "92586539.jpeg", "92740826.jpeg", "92789367.png", "93051673.png", "93631667.png", "94072719.jpeg", "9460078.jpeg", "94605233.png", "94642678.jpeg", "94659251.jpeg", "94743964.jpeg", "951578.jpeg", "95342705.png", "95846451.jpeg", "96459560.png", "96527606.jpeg", "97708985.jpeg", "98276453.jpeg", "9927417.jpeg", "99334505.jpeg", "99796785.jpeg"];
const avatarWoman = ["10426917.jpeg", "11207306.jpeg", "12025828.png", "12435133.png", "13106441.jpeg", "13766616.png", "14290705.jpeg", "15381063.jpeg", "15679926.jpeg", "16287010.png", "16858614.jpeg", "17004347.jpeg", "17132550.png", "17165796.jpeg", "18278220.jpeg", "18398459.jpeg", "1913050.jpeg", "19908068.png", "20369098.jpeg", "20454357.jpeg", "21007395.jpeg", "21342459.jpeg", "21369796.png", "2164116.jpeg", "22032238.jpeg", "22517706.jpeg", "22945815.png", "23296480.jpeg", "23348084.jpeg", "23414499.jpeg", "23418163.jpeg", "25496389.jpeg", "25863834.png", "25979917.png", "26819589.png", "28564369.jpeg", "29007237.png", "29351768.png", "30155917.jpeg", "31091484.jpeg", "31165369.jpeg", "33091769.jpeg", "33243872.jpeg", "33387259.jpeg", "33693555.jpeg", "34715226.png", "35134214.jpeg", "35314139.jpeg", "35634479.jpeg", "35943281.png", "36192107.jpeg", "36620245.jpeg", "36772251.jpeg", "38884852.jpeg", "39738321.jpeg", "39772079.jpeg", "40649173.jpeg", "41211752.jpeg", "41604114.jpeg", "41645593.png", "41876537.jpeg", "42180915.jpeg", "42252069.jpeg", "42353005.jpeg", "42908449.jpeg", "43143514.jpeg", "43402653.jpeg", "43455661.png", "43653021.jpeg", "44588240.jpeg", "44638142.jpeg", "4555032.jpeg", "45602478.jpeg", "45643778.jpeg", "46510824.jpeg", "46548452.jpeg", "47172719.jpeg", "47190288.jpeg", "47391759.jpeg", "48895987.jpeg", "49175535.jpeg", "49182608.jpeg", "49435559.jpeg", "49441374.jpeg", "4968466.jpeg", "50467820.png", "50892304.png", "51466332.png", "52536773.jpeg", "52623032.jpeg", "52747708.jpeg", "5333028.png", "53332899.jpeg", "53517109.jpeg", "54478714.jpeg", "55009598.png", "55100122.jpeg", "55415027.jpeg", "56163777.jpeg", "56301542.jpeg", "56459993.jpeg", "57694624.jpeg", "58579273.png", "58838017.png", "5962496.jpeg", "59861498.jpeg", "60390444.png", "61059168.jpeg", "61131475.png", "61580439.jpeg", "61588102.jpeg", "61661122.jpeg", "61765080.jpeg", "62039090.png", "62202399.jpeg", "62307366.png", "63359736.jpeg", "63667541.jpeg", "64089485.jpeg", "64142850.jpeg", "64177685.jpeg", "64288961.jpeg", "64637433.jpeg", "64810440.jpeg", "64989666.png", "66080601.jpeg", "6642076.jpeg", "66601919.jpeg", "6666930.jpeg", "66676084.png", "67966597.jpeg", "68178162.jpeg", "6891114.jpeg", "69811669.png", "70552124.jpeg", "70602343.jpeg", "70806556.png", "70914845.jpeg", "71394281.jpeg", "71946373.jpeg", "72075032.jpeg", "72081741.jpeg", "72181128.jpeg", "72944971.jpeg", "7308464.jpeg", "73184215.jpeg", "73259038.png", "73317464.jpeg", "73550558.jpeg", "73561070.jpeg", "73986661.jpeg", "73999693.jpeg", "74182457.jpeg", "75525048.png", "76038703.jpeg", "76133236.jpeg", "76674935.png", "7692721.png", "77987583.jpeg", "78033747.jpeg", "78347527.jpeg", "79173893.jpeg", "80044258.png", "80122630.jpeg", "80225614.png", "80292130.jpeg", "80684066.jpeg", "81436552.jpeg", "82010611.png", "82979846.jpeg", "83860341.jpeg", "84031295.jpeg", "84097833.jpeg", "84208291.png", "84228668.jpeg", "86982196.jpeg", "87914717.jpeg", "88006687.jpeg", "89324683.jpeg", "90114030.jpeg", "90286379.png", "90636973.jpeg", "91724224.jpeg", "91943855.jpeg", "92067442.jpeg", "92308531.jpeg", "92945294.jpeg", "93585954.png", "9422135.jpeg", "94859045.jpeg", "95334799.jpeg", "95345456.jpeg", "95350811.jpeg", "95357085.jpeg", "97597223.jpeg", "97972672.jpeg", "98041044.jpeg", "98082557.jpeg", "98343806.jpeg", "98657511.jpeg", "98771428.jpeg", "9999471.jpeg"];

function unique<T>(func: () => T): T {
  // TODO
  // Please avoid leaks
  return func();
}
