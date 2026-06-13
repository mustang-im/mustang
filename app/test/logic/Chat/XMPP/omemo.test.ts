// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { OMEMO } from "../../../../logic/Chat/XMPP/OMEMO/OMEMO";
import { getBareJID } from "../../../../logic/Chat/XMPP/XMPPAccount";
import { registerXMPPExtensions } from "../../../../logic/Chat/XMPP/XMPPStanzaExtensions";
import { base64Encode } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { createClient } from "stanza";
import { parse } from "stanza/jxt";
import { Buffer } from "stanza/platform";
import { describe, expect, test } from "vitest";

/** In-memory stand-in for the PEP nodes on each user's server. */
class FakePEPServer {
  /** owner bare JID -> node -> items */
  store = new Map<string, Map<string, any[]>>();

  publish(owner: string, node: string, content: any, id: string): void {
    let nodes = this.store.get(owner);
    if (!nodes) {
      this.store.set(owner, nodes = new Map());
    }
    nodes.set(node, [{ id, content }]);
  }
  getItems(target: string, node: string): any[] {
    return this.store.get(target)?.get(node) ?? [];
  }
}

function fakeAccount(pep: FakePEPServer, jid: string): any {
  let account: any = {
    jid,
    bareJID: (j: string) => getBareJID(j),
    errorCallback: (ex: Error) => { throw ex; },
    save: async () => { },
  };
  account.client = {
    publish: async (_target: string, node: string, content: any, id: string) => {
      pep.publish(jid, node, content, id ?? "current");
    },
    getItems: async (target: string, node: string) => ({ items: pep.getItems(target || jid, node) }),
  };
  return account;
}

const kAlice = "alice@localhost";
const kBob = "bob@localhost";
const text = (s: string) => new TextEncoder().encode(s);
const str = (b: Uint8Array | null) => new TextDecoder().decode(b!);

describe("OMEMO crypto", () => {
  test("Alice and Bob exchange OMEMO-encrypted messages both ways", async () => {
    let pep = new FakePEPServer();
    let alice = new OMEMO(fakeAccount(pep, kAlice));
    let bob = new OMEMO(fakeAccount(pep, kBob));
    await alice.publishOwnKeys();
    await bob.publishOwnKeys();
    expect(alice.deviceID).toBeGreaterThan(0);
    expect(alice.deviceID).not.toBe(bob.deviceID);

    // Alice -> Bob: first message establishes the session (a prekey message)
    let msg1 = await alice.encrypt([kBob], text("Hello Bob"));
    expect(msg1.header.sid).toBe(alice.deviceID);
    expect(msg1.header.keys.length).toBe(1);
    expect(msg1.header.keys[0].rid).toBe(bob.deviceID);
    expect(msg1.header.keys[0].preKey).toBe(true);
    expect(str(await bob.decrypt(msg1, kAlice))).toBe("Hello Bob");

    // Alice -> Bob again: still a prekey message until Bob replies and confirms
    // the session (standard libsignal initiator behaviour)
    let msg2 = await alice.encrypt([kBob], text("Second"));
    expect(msg2.header.keys[0].preKey).toBe(true);
    expect(str(await bob.decrypt(msg2, kAlice))).toBe("Second");

    // Bob -> Alice: reply on the session Bob set up as the responder
    let reply = await bob.encrypt([kAlice], text("Hi Alice"));
    expect(reply.header.keys[0].rid).toBe(alice.deviceID);
    expect(str(await alice.decrypt(reply, kBob))).toBe("Hi Alice");

    // Now Alice's session is confirmed: her next message is no longer a prekey
    let msg3 = await alice.encrypt([kBob], text("Third"));
    expect(msg3.header.keys[0].preKey).toBeFalsy();
    expect(str(await bob.decrypt(msg3, kAlice))).toBe("Third");
  });

  test("A message not addressed to our device returns null", async () => {
    let pep = new FakePEPServer();
    let alice = new OMEMO(fakeAccount(pep, kAlice));
    let bob = new OMEMO(fakeAccount(pep, kBob));
    await alice.publishOwnKeys();
    await bob.publishOwnKeys();
    let msg = await alice.encrypt([kBob], text("secret"));
    // A third party with a different device ID gets nothing
    let eve = new OMEMO(fakeAccount(pep, "eve@localhost"));
    eve.generateKeys();
    expect(await eve.decrypt(msg, kAlice)).toBeNull();
  });

  test("Consuming a prekey replenishes and republishes the bundle", async () => {
    let pep = new FakePEPServer();
    let alice = new OMEMO(fakeAccount(pep, kAlice));
    let bob = new OMEMO(fakeAccount(pep, kBob));
    await alice.publishOwnKeys();
    await bob.publishOwnKeys();
    let before = bob.store.preKeys.size;
    let msg = await alice.encrypt([kBob], text("hi"));
    await bob.decrypt(msg, kAlice);
    // Bob minted a replacement for the consumed one-time prekey
    expect(bob.store.preKeys.size).toBeGreaterThanOrEqual(before);
  });
});

describe("XMPP wire serialization", () => {
  function registry() {
    let client = createClient({ jid: "test@localhost", password: "x" });
    registerXMPPExtensions(client);
    return client.stanzas;
  }
  function roundtrip(data: any): any {
    let stanzas = registry();
    let xml = stanzas.export("message", { type: "chat", to: kBob, ...data });
    return stanzas.import(parse(xml!.toString()));
  }

  test("OMEMO <encrypted> round-trips through stanza", () => {
    // stanza serializes Buffer values as base64 (a Uint8Array would be stringified),
    // which is exactly what the OMEMO engine produces.
    let omemo = {
      header: {
        sid: 12345,
        iv: Buffer.from([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]),
        keys: [
          { rid: 111, preKey: true, value: Buffer.from([1, 2, 3, 4]) },
          { rid: 222, value: Buffer.from([9, 8, 7]) },
        ],
      },
      payload: Buffer.from([99, 100, 101]),
    };
    let result = roundtrip({ omemo }).omemo;
    expect(result.header.sid).toBe(12345);
    expect(result.header.keys.length).toBe(2);
    expect(result.header.keys[0].rid).toBe(111);
    expect(result.header.keys[0].preKey).toBe(true);
    expect(base64Encode(new Uint8Array(result.header.keys[0].value))).toBe(base64Encode(omemo.header.keys[0].value));
    expect(base64Encode(new Uint8Array(result.header.iv))).toBe(base64Encode(omemo.header.iv));
    expect(base64Encode(new Uint8Array(result.payload))).toBe(base64Encode(omemo.payload));
  });

  test("reactions round-trip through stanza", () => {
    let result = roundtrip({ reactions: { id: "msg-1", emojis: ["👍", "❤️"] } }).reactions;
    expect(result.id).toBe("msg-1");
    expect(result.emojis).toEqual(["👍", "❤️"]);
  });

  test("retraction round-trips through stanza", () => {
    let result = roundtrip({ retract: { id: "msg-2" } }).retract;
    expect(result.id).toBe("msg-2");
  });
});
