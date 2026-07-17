/** Round-trip the Signal calling signaling protobufs: build a CallMessage →
 * encode → decode → fields match (mirrors the WhatsApp callSignaling test). This
 * exercises the full nesting: ConnectionParametersV4 ⇄ signaling.Offer/Answer/
 * IceCandidate ⇄ the Signal-service CallMessage ⇄ Content.callMessage bytes. */
import {
  CallMessage, OfferType, HangupType, VideoCodecType,
  buildOffer, buildAnswer, buildIceUpdate, buildHangup, buildBusy,
  parseOfferParams, parseAnswerParams, parseIceCandidates,
  type ConnectionParametersV4,
} from "../../../../logic/Meet/Signal/signalingProto";
import { encode, decode } from "../../../../logic/Chat/Signal/Proto/codec";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

/** Encode a CallMessage to bytes (as it rides in Content.callMessage) and decode back. */
function roundtrip(msg: ReturnType<typeof buildOffer>) {
  return decode(CallMessage, encode(CallMessage, msg));
}

let callID = 0x0123_4567_89AB_CDEFn;

function sampleV4(publicKey: Uint8Array): ConnectionParametersV4 {
  return {
    publicKey,
    iceUfrag: "abcd",
    icePwd: "0123456789abcdef0123",
    receiveVideoCodecs: [{ type: VideoCodecType.VP8 }, { type: VideoCodecType.VP9 }],
    maxBitrateBps: 2_000_000n,
  };
}

test("offer round-trips the CallId, type, and V4 params", () => {
  let publicKey = randomBytes(32);
  let msg = roundtrip(buildOffer(callID, OfferType.VideoCall, sampleV4(publicKey)));
  expect(msg.offer!.id).toBe(callID);              // bigint: exact past 2^53
  expect(msg.offer!.type).toBe(OfferType.VideoCall);
  let v4 = parseOfferParams(msg.offer!)!;
  expect(bytesEqual(v4.publicKey!, publicKey)).toBe(true);
  expect(v4.iceUfrag).toBe("abcd");
  expect(v4.icePwd).toBe("0123456789abcdef0123");
  expect(v4.maxBitrateBps).toBe(2_000_000n);
  expect(v4.receiveVideoCodecs!.map(c => c.type)).toEqual([VideoCodecType.VP8, VideoCodecType.VP9]);
});

test("audio offer carries the audio type", () => {
  let msg = roundtrip(buildOffer(callID, OfferType.AudioCall, sampleV4(randomBytes(32))));
  expect(msg.offer!.type).toBe(OfferType.AudioCall);
});

test("answer round-trips the V4 params and is targeted at the caller's device", () => {
  let publicKey = randomBytes(32);
  let msg = roundtrip(buildAnswer(callID, sampleV4(publicKey), 3));
  expect(msg.answer!.id).toBe(callID);
  expect(msg.destinationDeviceId).toBe(3);          // targeted
  let v4 = parseAnswerParams(msg.answer!)!;
  expect(bytesEqual(v4.publicKey!, publicKey)).toBe(true);
});

test("ICE candidates round-trip — repeated, many per message", () => {
  let candidates = [
    "candidate:1 1 udp 2130706431 192.168.1.2 54321 typ host",
    "candidate:2 1 udp 1694498815 203.0.113.5 40000 typ srflx",
  ];
  // Caller broadcasts: no destinationDeviceId.
  let msg = roundtrip(buildIceUpdate(callID, candidates));
  expect(msg.iceUpdate!.length).toBe(2);
  expect(msg.iceUpdate![0].id).toBe(callID);
  expect(parseIceCandidates(msg)).toEqual(candidates);
  expect(msg.destinationDeviceId).toBeUndefined();
});

test("callee ICE is targeted at the caller's device", () => {
  let msg = roundtrip(buildIceUpdate(callID, ["candidate:1 1 udp 1 1.2.3.4 5 typ host"], { deviceId: 2 }));
  expect(msg.destinationDeviceId).toBe(2);
});

test("hangup round-trips type and device", () => {
  let msg = roundtrip(buildHangup(callID, HangupType.Accepted, 5));
  expect(msg.hangup!.id).toBe(callID);
  expect(msg.hangup!.type).toBe(HangupType.Accepted);
  expect(msg.hangup!.deviceId).toBe(5);
});

test("busy carries only the call id", () => {
  let msg = roundtrip(buildBusy(callID));
  expect(msg.busy!.id).toBe(callID);
  expect(msg.offer).toBeUndefined();
});

test("CallId keeps full 64-bit precision through the wire", () => {
  let big = 0xFEDC_BA98_7654_3210n;
  let msg = roundtrip(buildOffer(big, OfferType.AudioCall, sampleV4(randomBytes(32))));
  expect(msg.offer!.id).toBe(big);
});
