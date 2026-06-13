// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { setupChatTestEnv } from "./setup";
import { XMPPAccount } from "../../../../logic/Chat/XMPP/XMPPAccount";
import { XMPP1to1Chat } from "../../../../logic/Chat/XMPP/XMPP1to1Chat";
import { DummyChatStorage } from "../../../../logic/Chat/SQL/DummyChatStorage";
import { DeliveryStatus } from "../../../../logic/Chat/Message";
import { XMPPChatMessage } from "../../../../logic/Chat/XMPP/XMPPChatMessage";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

const kMe = "me@localhost";
const kAlice = "alice@localhost";

let account: XMPPAccount;
let chat: XMPP1to1Chat;
let sent: any[];

beforeAll(async () => {
  await setupChatTestEnv();
});

beforeEach(async () => {
  sent = [];
  account = new XMPPAccount();
  account.storage = new DummyChatStorage();
  account.name = account.username = kMe;
  account.jid = kMe;
  account.client = {
    sessionStarted: true,
    sendMessage: (stanza: any) => { sent.push(stanza); return stanza.id ?? "generated"; },
  } as any;
  let alice = await account.getPerson(kAlice, "Alice");
  chat = new XMPP1to1Chat(account);
  chat.id = kAlice;
  chat.contact = alice as any;
  account.rooms.set(chat.contact, chat);
});

/** Simulate an incoming stanza */
function incoming(fields: any) {
  return chat.addMessage({ from: kAlice, ...fields } as any);
}

describe("XMPP message features — receiving", () => {
  test("a reaction is applied to the target message", async () => {
    await incoming({ id: "m1", body: "Hello" });
    await incoming({ reactions: { id: "m1", emojis: ["👍"] } });
    let m1 = chat.messages.find(m => m.id == "m1");
    expect(m1.reactions.get(chat.contact as any)).toBe("👍");
    // Updating the set replaces it; empty removes it
    await incoming({ reactions: { id: "m1", emojis: ["🎉", "❤️"] } });
    expect(m1.reactions.get(chat.contact as any)).toBe("🎉❤️");
    await incoming({ reactions: { id: "m1", emojis: [] } });
    expect(m1.reactions.get(chat.contact as any)).toBeUndefined();
  });

  test("a correction edits the original message", async () => {
    await incoming({ id: "m2", body: "teh cat" });
    let result = await incoming({ id: "c1", body: "the cat", replace: "m2" });
    expect(result).toBeNull(); // a correction is not a new message
    let m2 = chat.messages.find(m => m.id == "m2") as XMPPChatMessage;
    expect(m2.text).toBe("the cat");
    expect(m2.edited).toBe(true);
    expect(chat.messages.length).toBe(1); // no extra message added
  });

  test("a retraction marks the message as deleted", async () => {
    await incoming({ id: "m3", body: "oops secret" });
    await incoming({ retract: { id: "m3" } });
    let m3 = chat.messages.find(m => m.id == "m3") as XMPPChatMessage;
    expect(m3.retracted).toBe(true);
    expect(m3.text).not.toBe("oops secret");
  });

  test("a delivery receipt and read marker update the delivery status", async () => {
    let out = chat.newMessage();
    out.id = "out1";
    out.outgoing = true;
    out.text = "hi";
    out.sent = new Date();
    chat.messages.add(out);

    await incoming({ receipt: { type: "received", id: "out1" } });
    expect(out.deliveryStatus).toBe(DeliveryStatus.User);
    await incoming({ marker: { type: "displayed", id: "out1" } });
    expect(out.deliveryStatus).toBe(DeliveryStatus.Seen);
  });

  test("a chat state sets the typing indicator", async () => {
    await incoming({ chatState: "composing" });
    expect(chat.contactIsTyping).toBe(true);
    await incoming({ chatState: "paused" });
    expect(chat.contactIsTyping).toBe(false);
    // a real message clears typing too
    await incoming({ chatState: "composing" });
    await incoming({ id: "m4", body: "done typing" });
    expect(chat.contactIsTyping).toBe(false);
  });

  test("a reply sets inReplyTo", async () => {
    let msg = await incoming({ id: "m5", body: "I agree", reply: { id: "m1", to: kMe } });
    expect(msg.inReplyTo).toBe("m1");
  });
});

describe("XMPP message features — sending", () => {
  test("sendReaction sends the full emoji set and shows it locally", async () => {
    let target = chat.newMessage();
    target.id = "t1";
    chat.messages.add(target);
    await chat.sendReaction(target, ["👍"]);
    expect(sent[0].reactions).toEqual({ id: "t1", emojis: ["👍"] });
    expect(target.reactions.get(account.getOwnContact())).toBe("👍");
  });

  test("sendCorrection sends a replace and updates locally", async () => {
    let target = chat.newMessage();
    target.id = "t2";
    target.text = "frist";
    chat.messages.add(target);
    await chat.sendCorrection(target, "first");
    expect(sent[0].replace).toBe("t2");
    expect(sent[0].body).toBe("first");
    expect(target.text).toBe("first");
    expect((target as XMPPChatMessage).edited).toBe(true);
  });

  test("sendRetraction sends a retract for the message", async () => {
    let target = chat.newMessage();
    target.id = "t3";
    chat.messages.add(target);
    await chat.sendRetraction(target);
    expect(sent[0].retract).toEqual({ id: "t3" });
    expect((target as XMPPChatMessage).retracted).toBe(true);
  });

  test("sendMessage requests a receipt and marks the message markable", async () => {
    let msg = chat.newMessage();
    msg.text = "Hi Alice";
    await chat.sendMessage(msg);
    expect(sent[0].body).toBe("Hi Alice");
    expect(sent[0].receipt).toEqual({ type: "request" });
    expect(sent[0].marker).toEqual({ type: "markable" });
    expect(msg.deliveryStatus).toBe(DeliveryStatus.Server);
  });

  test("a displayed marker is sent when our user reads an incoming message", async () => {
    let msg = await incoming({ id: "r1", body: "read me" });
    await chat.sendDisplayedMarker(msg);
    expect(sent[0].marker).toEqual({ type: "displayed", id: "r1" });
  });
});
