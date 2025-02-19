import { appGlobal } from './app';
import { MailAccount } from './Mail/MailAccount';
import { Folder, SpecialFolder } from './Mail/Folder';
import { ChatAccount } from './Chat/ChatAccount';
import { UserChatMessage } from './Chat/Message';
import { ChatPerson } from './Chat/Person';
import { PersonUID } from './Abstract/PersonUID';
import { ContactEntry, Person } from './Abstract/Person';
import { Group } from './Abstract/Group';
import { Chat } from './Chat/Chat';
import { Directory, File } from './Files/File';
import { Calendar } from './Calendar/Calendar';
import { Addressbook } from './Contacts/Addressbook';
import { MeetAccount } from './Meet/MeetAccount';
import { Event } from './Calendar/Event';
import { ArrayColl, type Collection } from 'svelte-collections';
import { faker } from '@faker-js/faker';

export async function getTestObjects(): Promise<void> {
  appGlobal.me = fakeChatPerson();
  appGlobal.addressbooks.add(fakeAddressbook());
  appGlobal.persons.addAll(fakePersons(50, appGlobal.addressbooks.first));
  appGlobal.emailAccounts.add(fakeMailAccount(appGlobal.persons, appGlobal.me));
  appGlobal.chatAccounts.add(fakeChatAccount(appGlobal.persons, appGlobal.me));
  appGlobal.calendars.add(fakeCalendar(appGlobal.persons));
  appGlobal.files.addAll(fakeSharedDir(appGlobal.persons));
}

export function fakeAddressbook(): Addressbook {
  let addressbook = new Addressbook();
  addressbook.name = faker.company.name();
  addressbook.url = faker.internet.url();
  addressbook.username = faker.internet.userName();
  return addressbook;
}

export function fakePersons(count = 50, addressbook?: Addressbook): Collection<Person> {
  let persons = new ArrayColl<Person>();
  for (let i = 1; i <= count; i++) {
    let person = fakeChatPerson();
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

export function fakeChatPerson(): Person {
  let person = new ChatPerson();
  person.id = faker.string.uuid();
  let male = Math.random() < 0.5;
  person.firstName = faker.name.firstName(male ? "male" : "female");
  person.lastName = faker.name.lastName();
  person.name = person.firstName + " " + person.lastName;
  person.emailAddresses.add(new ContactEntry(faker.internet.email(person.firstName, person.lastName).toLowerCase(), "work"));
  person.emailAddresses.add(new ContactEntry(faker.internet.email(person.firstName, person.lastName).toLowerCase(), "home"));
  person.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-170-### ####'), "mobile"));
  person.phoneNumbers.add(new ContactEntry(faker.phone.number('+49-###-######'), "work"));
  person.chatAccounts.add(new ContactEntry(person.phoneNumbers.first.value, "WhatsApp"));
  person.chatAccounts.add(new ContactEntry(person.emailAddresses.first.value, "Teams"));
  person.groups.add(new ContactEntry(faker.company.name(), "Mustang"));
  person.groups.add(new ContactEntry(faker.company.name(), "WhatsApp"));
  person.groups.add(new ContactEntry(faker.company.name(), "Teams"));
  let address = faker.location.streetAddress() + "\n" +
    faker.location.zipCode() + " " +
    faker.location.city();
  person.streetAddresses.add(new ContactEntry(address, "home"));
  person.picture = avatar(male);
  person.company = faker.company.name();
  person.department = faker.commerce.department();
  person.position = faker.person.jobTitle();
  return person;
}

export function fakeMailAccount(persons: Collection<Person>, me: Person, msgCount = 300): MailAccount {
  let account = new MailAccount();
  account.name = "Yahoo";
  account.emailAddress = me.emailAddresses.first.value;
  account.realname = me.name;
  account.username = account.emailAddress;
  account.password = faker.internet.password();
  account.hostname = "imap." + faker.internet.domainName();
  account.port = 993;
  account.tls = 2;
  me.emailAddresses.add(new ContactEntry(account.emailAddress, "Primary"));
  let meUID = new PersonUID(account.emailAddress, account.realname);

  for (let name of ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam']) {
    let folder = account.newFolder();
    folder.name = name;
    folder.id = name.toLowerCase();
    folder.specialFolder = folder.name.toLowerCase() as SpecialFolder;
    account.rootFolders.push(folder);
  }
  let inbox = account.rootFolders.first;
  inbox.specialFolder = SpecialFolder.Inbox;

  let lastReadTime = new Date();
  lastReadTime.setHours(lastReadTime.getHours() - 1);
  let emailNr = 0;
  for (let person of persons) {
    let pUID = PersonUID.fromPerson(person);
    for (let i = 1; i <= msgCount; i++) {
      emailNr++;
      let folder: Folder;
      if (Math.random() < 0.99) {
        folder = inbox;
      } else {
        let folderIndex = Math.floor(Math.random() * account.rootFolders.length);
        folder = account.rootFolders.getIndex(folderIndex) ?? inbox;
      }
      let msg = folder.newEMail();
      msg.needToLoadBody = false;
      msg.id = emailNr + '@' + account.emailAddress;
      msg.sent = faker.date.past(0.1);
      msg.received = new Date(msg.sent.getTime() + 500);
      msg.size = Math.ceil(Math.random() * 2048 + 200);
      msg.isRead = msg.received < lastReadTime;
      msg.subject = faker.hacker.phrase().replace("!", "").replace(/,.*/, "");
      msg.outgoing = Math.random() < 0.4;
      msg.contact = person;
      msg.from = msg.outgoing ? meUID : pUID;
      msg.to.add(msg.outgoing ? pUID : meUID);
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

export function fakeMailPerson(): PersonUID {
  return new PersonUID(faker.internet.email().toLowerCase(), faker.name.fullName());
}

export function fakeChatAccount(persons: Collection<Person>, me: Person, msgCount = 300): ChatAccount {
  let chatAccount = new ChatAccount();
  chatAccount.name = "Test chat 1";
  chatAccount.realname = me.name;

  for (let person of persons) {
    let chat = new Chat(chatAccount);
    chat.id = person.id + "-" + faker.string.uuid();
    chat.contact = person;
    chatAccount.chats.set(person, chat);
    chatAccount.persons.add(person);

    let messages = chat.messages;
    let lastTime = faker.date.past(0.1);
    for (let i = 1; i <= msgCount; i++) {
      let msg = new UserChatMessage(chat);
      msg.id = faker.string.uuid();
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
    let event = new Event(calendar);
    event.startTime = i < 5 ? faker.date.recent() : faker.date.future({ years: 0.2 });
    let endTimeMax = new Date(event.startTime);
    endTimeMax.setMinutes(endTimeMax.getMinutes() + 120);
    event.endTime = faker.date.between({ from: event.startTime, to: endTimeMax });
    event.title = faker.company.buzzPhrase();
    event.descriptionText = faker.hacker.phrase() + "\n" + faker.hacker.phrase();
    event.location = faker.datatype.boolean ? faker.location.streetAddress() : faker.location.nearbyGPSCoordinate().join(", ");
    let participantsCount = Math.random() * 5;
    for (let i = 1; i < participantsCount; i++) {
      event.participants.add(fakeMailPerson());
    }
    calendar.events.add(event);
  }
  return calendar;
}

export function fakeMeetAccount(): MeetAccount {
  let account = new MeetAccount();
  account.name = faker.company.name();
  account.url = faker.internet.url();
  account.username = faker.internet.userName();
  return account;
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
  directory.name = unique(() => faker.system.fileName({ extensionCount: 0 }));
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
  file.name = unique(faker.system.commonFileName);
  let parts = file.name.split(".");
  file.ext = parts.pop();
  file.nameWithoutExt = parts.join(".");
  file.length = faker.number.int({ max: 40000000 });
  file.lastMod = faker.date.past();
  file.setParent(parentDir);
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
