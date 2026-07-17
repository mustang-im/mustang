// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
import { WhatsAppGroupChatRoom } from "../../../../logic/Chat/WhatsApp/WhatsAppGroupChatRoom";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { DummyChatStorage } from "../../../../logic/Chat/SQL/DummyChatStorage";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { Person } from "../../../../logic/Abstract/Person";
import { expect, test } from "vitest";

/** A minimal account so we can construct a group room (the metadata holder). */
function makeAccount(): WhatsAppAccount {
  appGlobal.addressbooks.clear();
  appGlobal.chatAccounts.clear();
  let addressbook = new Addressbook();
  addressbook.storage = new DummyAddressbookStorage();
  appGlobal.addressbooks.add(addressbook);
  appGlobal.personalAddressbook = addressbook;
  appGlobal.me = new Person();
  let account = new WhatsAppAccount();
  account.storage = new DummyChatStorage();
  account.deviceJID = JID.parse("491700000000:5@s.whatsapp.net");
  appGlobal.chatAccounts.add(account);
  return account;
}

function groupRoom(account: WhatsAppAccount): WhatsAppGroupChatRoom {
  let room = account.newRoom(true) as WhatsAppGroupChatRoom;
  room.id = "120363041234567890@g.us";
  return room;
}

/** A text node as the binary decoder delivers it: content is bytes, not a string. */
function textNode(tag: string, text: string): WANode {
  return new WANode(tag, {}, new TextEncoder().encode(text));
}

/** A LID-addressed group: members carry their phone number in `phone_number`. */
function lidGroupNode(): WANode {
  return new WANode("group", {
    id: "120363041234567890", subject: "Weekend Hikers", addressing_mode: "lid",
    creation: "1699000000", s_t: "1700000000", s_o: "111@lid", size: "3",
  }, [
    new WANode("participant", { jid: "111@lid", type: "superadmin", phone_number: "49170000001@s.whatsapp.net" }),
    new WANode("participant", { jid: "222@lid", type: "admin", phone_number: "49170000002@s.whatsapp.net" }),
    new WANode("participant", { jid: "333@lid", phone_number: "49170000003@s.whatsapp.net" }),
    new WANode("description", { id: "topic1" }, [textNode("body", "Trail plans and meetup times")]),
    new WANode("announcement", {}),
    new WANode("locked", {}),
  ]);
}

test("parses a LID-addressed group: subject, mode, participants, admin flags, cross-fields, description", () => {
  let room = groupRoom(makeAccount());
  room.parseMetadata(lidGroupNode());
  expect(room.subject).toBe("Weekend Hikers");
  expect(room.addressingMode).toBe("lid");
  expect(room.description).toBe("Trail plans and meetup times");

  expect(room.participants.length).toBe(3);
  let [owner, admin, member] = room.participants;
  expect(owner.jid.toString()).toBe("111@lid");
  expect(owner.isAdmin).toBe(true);
  expect(owner.isSuperAdmin).toBe(true);
  expect(owner.phoneNumber!.toString()).toBe("49170000001@s.whatsapp.net"); // LID jid → PN in phone_number
  expect(owner.lid).toBeUndefined();
  expect(admin.isAdmin).toBe(true);
  expect(admin.isSuperAdmin).toBe(false);
  expect(member.isAdmin).toBe(false);
  expect(member.isSuperAdmin).toBe(false);
});

test("parses a PN-addressed group: members carry their LID in `lid`", () => {
  let room = groupRoom(makeAccount());
  room.parseMetadata(new WANode("group", { id: "123-456", subject: "Family", addressing_mode: "pn" }, [
    new WANode("participant", { jid: "49170000001@s.whatsapp.net", type: "superadmin", lid: "111@lid" }),
    new WANode("participant", { jid: "49170000002@s.whatsapp.net" }),
  ]));
  expect(room.addressingMode).toBe("pn");
  expect(room.participants.length).toBe(2);
  let [owner, member] = room.participants;
  expect(owner.jid.toString()).toBe("49170000001@s.whatsapp.net");
  expect(owner.lid!.toString()).toBe("111@lid"); // PN jid → LID in `lid`
  expect(owner.phoneNumber).toBeUndefined();
  expect(owner.isSuperAdmin).toBe(true);
  expect(member.isAdmin).toBe(false);
});

test("addressing_mode defaults to lid when the attr is absent", () => {
  let room = groupRoom(makeAccount());
  room.parseMetadata(new WANode("group", { id: "1", subject: "X" }));
  expect(room.addressingMode).toBe("lid");
});

test("ensureMetadata sends a w:g2 interactive query to the group JID and parses the result", async () => {
  let sent: WANode[] = [];
  let account = makeAccount();
  account.connection = {
    async sendIQ(node: WANode) {
      sent.push(node);
      return new WANode("iq", { type: "result" }, [lidGroupNode()]);
    },
  } as any;
  let room = groupRoom(account);
  await room.ensureMetadata();
  let query = sent.find(n => n.attrs.xmlns == "w:g2")!;
  expect(query).toBeDefined();
  expect(query.attrs.type).toBe("get");
  expect(query.attrs.to).toBe("120363041234567890@g.us"); // the group JID itself, not a server
  expect(query.child("query")!.attrs.request).toBe("interactive");
  expect(room.subject).toBe("Weekend Hikers");
  expect(room.participants.length).toBe(3);
});
