// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
import { WhatsAppGroupChatRoom } from "../../../../logic/Chat/WhatsApp/WhatsAppGroupChatRoom";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { SignalStore } from "../../../../logic/Chat/Signal/Crypto/Store";
import { DummyChatStorage } from "../../../../logic/Chat/SQL/DummyChatStorage";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { Person } from "../../../../logic/Abstract/Person";
import { Group } from "../../../../logic/Abstract/Group";
import { expect, test } from "vitest";

const kGroupJID = "120363041234567890@g.us";

/** Records sent stanzas, and answers a `w:g2` IQ with a configurable `<group>`. */
class FakeConnection {
  sent: WANode[] = [];
  /** The `<group>` element to return for the metadata query. */
  groupNode: WANode | null = null;
  async sendNode(node: WANode): Promise<void> {
    this.sent.push(node);
  }
  async sendIQ(): Promise<WANode> {
    return new WANode("iq", { type: "result" }, this.groupNode ? [this.groupNode] : null);
  }
}

function makeAccount(connection: FakeConnection): WhatsAppAccount {
  appGlobal.addressbooks.clear();
  appGlobal.chatAccounts.clear();
  let addressbook = new Addressbook();
  addressbook.storage = new DummyAddressbookStorage();
  appGlobal.addressbooks.add(addressbook);
  appGlobal.personalAddressbook = addressbook;
  appGlobal.me = new Person();
  appGlobal.me.name = "Me";

  let account = new WhatsAppAccount();
  account.storage = new DummyChatStorage();
  account.deviceJID = JID.parse("491700000000:5@s.whatsapp.net");
  account.signalStore = SignalStore.createNew();
  account.connection = connection as any;
  appGlobal.chatAccounts.add(account);
  return account;
}

/** Creates the group room and loads its metadata from a seeded `<group>` (the
 * participants the server reports), so a following notification patches it. */
async function seededRoom(account: WhatsAppAccount, connection: FakeConnection, participants: string[]): Promise<WhatsAppGroupChatRoom> {
  connection.groupNode = new WANode("group",
    { id: "120363041234567890", subject: "Original", addressing_mode: "lid" },
    participants.map(jid => new WANode("participant", { jid })));
  let room = await account.getOrCreateRoom(JID.parse(kGroupJID)) as WhatsAppGroupChatRoom;
  await room.ensureMetadata();
  return room;
}

test("a `subject` notification updates the room/group name and acks", async () => {
  let connection = new FakeConnection();
  let account = makeAccount(connection);
  let room = await seededRoom(account, connection, ["111@lid"]);

  await (account as any).onNotification(new WANode("notification",
    { from: kGroupJID, type: "w:gp2", id: "n1", participant: "111@lid" },
    [new WANode("subject", { subject: "Renamed Group", s_t: "1700000000", s_o: "111@lid" })]));

  expect(room.name).toBe("Renamed Group");
  expect((room.contact as Group).name).toBe("Renamed Group");
  expect(room.subject).toBe("Renamed Group");

  let ack = connection.sent.find(n => n.tag == "ack")!;
  expect(ack).toBeDefined();
  expect(ack.attrs.class).toBe("notification");
  expect(ack.attrs.type).toBe("w:gp2");
  expect(ack.attrs.to).toBe(kGroupJID);
  expect(ack.attrs.id).toBe("n1");
});

test("an `add` adds a participant to the room's metadata", async () => {
  let connection = new FakeConnection();
  let account = makeAccount(connection);
  let room = await seededRoom(account, connection, ["111@lid"]);

  await (account as any).onNotification(new WANode("notification",
    { from: kGroupJID, type: "w:gp2", id: "n2", participant: "111@lid" },
    [new WANode("add", { v_id: "7" }, [new WANode("participant", { jid: "222@lid" })])]));

  expect(room.participants.map(p => p.jid.toString())).toContain("222@lid");
  expect(connection.sent.some(n => n.tag == "ack")).toBe(true);
});

test("a `remove` drops the participant and rotates our group sender key", async () => {
  let connection = new FakeConnection();
  let account = makeAccount(connection);
  let room = await seededRoom(account, connection, ["111@lid", "222@lid"]);
  // Pretend we already minted a group sender key — a remove must drop it.
  account.signalStore!.senderKeys.set(`${kGroupJID}|99887766.5`, {} as any);

  await (account as any).onNotification(new WANode("notification",
    { from: kGroupJID, type: "w:gp2", id: "n3", participant: "111@lid" },
    [new WANode("remove", { v_id: "8" }, [new WANode("participant", { jid: "222@lid" })])]));

  expect(room.participants.map(p => p.jid.toString())).not.toContain("222@lid");
  expect(account.signalStore!.senderKeys.has(`${kGroupJID}|99887766.5`)).toBe(false); // rotated
  expect(connection.sent.some(n => n.tag == "ack")).toBe(true);
});
