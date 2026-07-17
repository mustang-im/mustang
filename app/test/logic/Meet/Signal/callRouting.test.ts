/** Round-trip a call Offer through the ACCOUNT layer (not just the protobuf):
 * SignalMeetAccount.sendCallMessage wraps the RingRTC CallMessage into
 * `Content.callMessage` and hands it to `mainAccount.sendContent`; feeding those
 * captured bytes into the peer's `SignalMeetAccount.handleCallMessage` parses back
 * the same Offer and starts an incoming call. This mirrors how SignalAccount routes
 * a decrypted `content.callMessage` to the dependent Meet account (and WhatsApp's
 * `<call>`-stanza → WhatsAppMeetAccount path). The media plane is not exercised. */
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { SignalMeetAccount } from "../../../../logic/Meet/Signal/SignalMeetAccount";
import {
  CallMessage, OfferType, VideoCodecType,
  buildOffer, parseOfferParams, type CallMessage as CallMessageType, type ConnectionParametersV4,
} from "../../../../logic/Meet/Signal/signalingProto";
import { encode, decode } from "../../../../logic/Chat/Signal/Proto/codec";
import { ServiceId } from "../../../../logic/Chat/Signal/ServiceId";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

let callID = 0x0123_4567_89ABn;

function sampleV4(publicKey: Uint8Array): ConnectionParametersV4 {
  return {
    publicKey,
    iceUfrag: "abcd",
    icePwd: "0123456789abcdef0123",
    receiveVideoCodecs: [{ type: VideoCodecType.VP8 }],
    maxBitrateBps: 2_000_000n,
  };
}

/** A fake SignalAccount that only does what the calling layer needs: hold our ACI
 * and capture every `sendContent`. No crypto, no connection. */
function fakeChatAccount(aci: ServiceId) {
  let sent: { recipients: ServiceId[], content: { callMessage?: Uint8Array }, timestamp: number }[] = [];
  return {
    aci,
    sent,
    async sendContent(recipients: ServiceId[], content: { callMessage?: Uint8Array }, timestamp: number) {
      sent.push({ recipients, content, timestamp });
    },
  };
}

/** A SignalMeetAccount whose newMeeting() records the parsed incoming Offer instead
 * of building a real (WebRTC) SignalCall, so the test stays on the signaling path. */
class CapturingMeetAccount extends SignalMeetAccount {
  captured: { callMessage: CallMessageType, from: ServiceId, fromDeviceID: number } | null = null;
  newMeeting(): any {
    let self = this;
    return {
      callID: undefined,
      state: "init",
      async onIncomingOffer(callMessage: CallMessageType, from: ServiceId, fromDeviceID: number) {
        self.captured = { callMessage, from, fromDeviceID };
      },
      async onCallMessage() {},
    };
  }
}

test("an outbound Offer is wrapped into Content.callMessage and sent via mainAccount.sendContent", async () => {
  let alice = new SignalMeetAccount();
  let aliceChat = fakeChatAccount(ServiceId.aci(randomBytes(16)));
  alice.mainAccount = aliceChat as any;
  let bob = ServiceId.aci(randomBytes(16));

  let publicKey = randomBytes(32);
  await alice.sendCallMessage([bob], buildOffer(callID, OfferType.VideoCall, sampleV4(publicKey)));

  expect(aliceChat.sent.length).toBe(1);
  let sent = aliceChat.sent[0];
  expect(sent.recipients).toEqual([bob]);
  expect(sent.content.callMessage).toBeInstanceOf(Uint8Array); // wrapped as Content.callMessage bytes

  let callMessage = decode(CallMessage, sent.content.callMessage!);
  expect(callMessage.offer!.id).toBe(callID);
  expect(callMessage.offer!.type).toBe(OfferType.VideoCall);
});

test("account-layer round-trip: Alice's Offer parses back to the same Offer at Bob's handleCallMessage", async () => {
  // Alice sends.
  let alice = new SignalMeetAccount();
  let aliceChat = fakeChatAccount(ServiceId.aci(randomBytes(16)));
  alice.mainAccount = aliceChat as any;
  let bob = ServiceId.aci(randomBytes(16));
  let aliceDeviceID = 1;

  let publicKey = randomBytes(32);
  await alice.sendCallMessage([bob], buildOffer(callID, OfferType.VideoCall, sampleV4(publicKey)));
  let callMessageBytes = aliceChat.sent[0].content.callMessage!;

  // Bob receives: drive the inbound account hook with the exact wire bytes.
  let bobMeet = new CapturingMeetAccount();
  bobMeet.mainAccount = fakeChatAccount(bob) as any;
  let aliceServiceId = ServiceId.aci(aliceChat.aci.uuid);
  bobMeet.handleCallMessage(callMessageBytes, aliceServiceId, aliceDeviceID);

  expect(bobMeet.captured).not.toBeNull();
  expect(bobMeet.captured!.from.equals(aliceServiceId)).toBe(true);
  expect(bobMeet.captured!.fromDeviceID).toBe(aliceDeviceID);

  // Same Offer survived the account-layer round trip.
  let offer = bobMeet.captured!.callMessage.offer!;
  expect(offer.id).toBe(callID);
  expect(offer.type).toBe(OfferType.VideoCall);
  let v4 = parseOfferParams(offer)!;
  expect(bytesEqual(v4.publicKey!, publicKey)).toBe(true);
  expect(v4.iceUfrag).toBe("abcd");
});

test("an incoming Offer with no prior call starts exactly one new meeting", () => {
  let before = appGlobal.meetings.length;
  let bobMeet = new CapturingMeetAccount();
  bobMeet.mainAccount = fakeChatAccount(ServiceId.aci(randomBytes(16))) as any;
  let alice = ServiceId.aci(randomBytes(16));

  let offerBytes = encode(CallMessage, buildOffer(callID, OfferType.AudioCall, sampleV4(randomBytes(32))));
  bobMeet.handleCallMessage(offerBytes, alice, 2);

  expect(bobMeet.captured).not.toBeNull();
  expect(bobMeet.captured!.callMessage.offer!.type).toBe(OfferType.AudioCall);
  expect(appGlobal.meetings.length).toBe(before + 1); // newMeeting() was added to appGlobal.meetings
});
