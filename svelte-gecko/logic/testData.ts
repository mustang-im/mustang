import { AppGlobal } from './app';
import { ChatAccount } from './Chat/Account';
import { ArrayColl, MapColl } from 'svelte-collections';
import { ChatMessage } from './Chat/Message';
import { Person } from './Person/Person';
import type { MailAccount } from './Mail/Account';
import { faker } from '@faker-js/faker';

export async function getTestObjects(): Promise<AppGlobal> {
  let appGlobal = new AppGlobal();
  let chatAccount = new ChatAccount();
  appGlobal.emailAccounts = new MapColl<string, MailAccount>();
  appGlobal.chatAccounts = new MapColl<string, ChatAccount>();
  appGlobal.chatAccounts.set("Test chat 1", chatAccount);

  for (let i = 1; i < 50; i++) {
    let person = new Person();
    person.firstName = faker.name.firstName();
    person.lastName = faker.name.lastName();
    person.name = person.firstName + " " + person.lastName;
    person.emailAddresses.add(faker.internet.email(person.firstName, person.lastName));
    person.emailAddresses.add(faker.internet.email(person.firstName, person.lastName));
    person.phoneNumbers.add(faker.phone.number('+49-170-### ####'));
    person.phoneNumbers.add(faker.phone.number('+49-###-######'));
    person.picture = faker.image.avatar();

    let messages = new ArrayColl<ChatMessage>();
    chatAccount.messagesByPerson.set(person, messages);
    chatAccount.persons.add(person);
    for (let i = 1; i < 300; i++) {
      let msg = new ChatMessage();
      msg.contact = person;
      msg.outgoing = Math.random() < 0.4;
      msg.sent = faker.date.past(0.01);
      msg.received = new Date(msg.sent.getMilliseconds() + 500);
      msg.text = faker.hacker.phrase();
      msg.html = msg.text;
      messages.add(msg);
    }
  }
  return appGlobal;
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

