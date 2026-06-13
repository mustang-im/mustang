import {
  CallAction, parseCallStanza, buildOffer, buildAccept, buildICE, buildReject, buildTerminate,
} from "../../../../logic/Meet/WhatsApp/whatsAppCallSignaling";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { encodeNode } from "../../../../logic/Chat/WhatsApp/Binary/encoder";
import { decodeNode } from "../../../../logic/Chat/WhatsApp/Binary/decoder";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/WhatsApp/Crypto/primitives";
import { expect, test } from "vitest";

let me = JID.parse("412300000000@s.whatsapp.net");
let peer = JID.parse("312300000000@s.whatsapp.net");

/** Sends a stanza through the real binary codec, like the wire, then parses it. */
function roundtrip(node: WANode) {
  return parseCallStanza(decodeNode(encodeNode(node)));
}

const OFFER_SDP = "v=0\r\no=- 1 1 IN IP4 0.0.0.0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=fingerprint:sha-256 AA:BB\r\n";

test("web offer carries the WebRTC SDP, the E2E key, and the video flag", () => {
  let encKey = randomBytes(48);
  let signal = roundtrip(buildOffer(peer, me, "CALL1", OFFER_SDP, encKey, true))!;
  expect(signal.action).toBe(CallAction.Offer);
  expect(signal.callID).toBe("CALL1");
  expect(signal.peer.toString()).toBe(me.toString()); // "from" is the sender
  expect(signal.callCreator).toBe(me.toString());
  expect(signal.isVideo).toBe(true);
  expect(signal.sdp).toBe(OFFER_SDP);
  expect(bytesEqual(signal.encKey!, encKey)).toBe(true);
});

test("audio-only offer has no video flag", () => {
  let signal = roundtrip(buildOffer(peer, me, "CALL2", OFFER_SDP, randomBytes(48), false))!;
  expect(signal.isVideo).toBe(false);
  expect(signal.sdp).toBe(OFFER_SDP);
});

test("accept carries the answer SDP", () => {
  let incoming = { action: CallAction.Offer, callID: "CALL3", peer, callCreator: peer.toString(), isVideo: false, isGroup: false };
  let answerSDP = "v=0\r\na=answer\r\na=fingerprint:sha-256 CC:DD\r\n";
  let signal = roundtrip(buildAccept(incoming, me, answerSDP))!;
  expect(signal.action).toBe(CallAction.Accept);
  expect(signal.callID).toBe("CALL3");
  expect(signal.sdp).toBe(answerSDP);
});

test("ICE candidate trickles via the transport action", () => {
  let candidate = "candidate:1 1 UDP 2130706431 192.168.1.2 54321 typ host";
  let signal = roundtrip(buildICE(peer, me, "CALL4", candidate))!;
  expect(signal.action).toBe(CallAction.Transport);
  expect(signal.iceCandidate).toBe(candidate);
});

test("reject and terminate round-trip with reason", () => {
  let incoming = { action: CallAction.Offer, callID: "CALL5", peer, callCreator: peer.toString(), isVideo: false, isGroup: false };
  expect(roundtrip(buildReject(incoming, me))!.action).toBe(CallAction.Reject);
  let terminate = roundtrip(buildTerminate(peer, me, "CALL5", "timeout"))!;
  expect(terminate.action).toBe(CallAction.Terminate);
  expect(terminate.reason).toBe("timeout");
});

test("non-call stanza is ignored", () => {
  let message = new WANode("message", { from: me.toString(), id: "1" }, [new WANode("body", {}, "hi")]);
  expect(parseCallStanza(decodeNode(encodeNode(message)))).toBeNull();
});
