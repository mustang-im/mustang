/** The Signal calling DH → SRTP key derivation (Docs/07 §C.2): both peers,
 * deriving from their own private key + the peer's public key bound to the same
 * caller/callee identity keys, must reach identical SRTPKeys. */
import { deriveSRTPKeys, newCallKeyPair, sdpToV4 } from "../../../../logic/Meet/Signal/callSRTP";
import { VideoCodecType } from "../../../../logic/Meet/Signal/signalingProto";
import { bytesEqual, randomBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

test("both peers derive identical SRTP keys from the DH", () => {
  let caller = newCallKeyPair();
  let callee = newCallKeyPair();
  let callerIdentity = randomBytes(33);   // DJB form (0x05 ‖ pub)
  let calleeIdentity = randomBytes(33);

  let atCaller = deriveSRTPKeys(caller.privateKey, callee.publicKey, callerIdentity, calleeIdentity);
  let atCallee = deriveSRTPKeys(callee.privateKey, caller.publicKey, callerIdentity, calleeIdentity);

  expect(bytesEqual(atCaller.offerKey, atCallee.offerKey)).toBe(true);
  expect(bytesEqual(atCaller.offerSalt, atCallee.offerSalt)).toBe(true);
  expect(bytesEqual(atCaller.answerKey, atCallee.answerKey)).toBe(true);
  expect(bytesEqual(atCaller.answerSalt, atCallee.answerSalt)).toBe(true);
});

test("the offer and answer keys differ (directional)", () => {
  let caller = newCallKeyPair();
  let callee = newCallKeyPair();
  let keys = deriveSRTPKeys(caller.privateKey, callee.publicKey, randomBytes(33), randomBytes(33));
  expect(bytesEqual(keys.offerKey, keys.answerKey)).toBe(false);
  expect(keys.offerKey.length).toBe(32);
  expect(keys.offerSalt.length).toBe(12);
});

test("binding to different identity keys yields different SRTP keys", () => {
  let caller = newCallKeyPair();
  let callee = newCallKeyPair();
  let a = deriveSRTPKeys(caller.privateKey, callee.publicKey, randomBytes(33), randomBytes(33));
  let b = deriveSRTPKeys(caller.privateKey, callee.publicKey, randomBytes(33), randomBytes(33));
  expect(bytesEqual(a.offerKey, b.offerKey)).toBe(false);
});

test("sdpToV4 extracts ufrag, pwd and receive codecs", () => {
  let sdp = [
    "v=0",
    "a=ice-ufrag:Xy12",
    "a=ice-pwd:secretsecretsecretsecret",
    "m=video 9 UDP/TLS/RTP/SAVPF 96 98",
    "a=rtpmap:96 VP8/90000",
    "a=rtpmap:98 VP9/90000",
  ].join("\r\n");
  let publicKey = randomBytes(32);
  let v4 = sdpToV4(sdp, publicKey, 1_500_000n);
  expect(v4.iceUfrag).toBe("Xy12");
  expect(v4.icePwd).toBe("secretsecretsecretsecret");
  expect(v4.maxBitrateBps).toBe(1_500_000n);
  expect(v4.receiveVideoCodecs!.map(c => c.type)).toEqual([VideoCodecType.VP8, VideoCodecType.VP9]);
  expect(bytesEqual(v4.publicKey!, publicKey)).toBe(true);
});
