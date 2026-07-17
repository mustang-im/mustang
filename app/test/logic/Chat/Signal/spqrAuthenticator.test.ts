import { Authenticator, MAC_SIZE } from "../../../../logic/Chat/Signal/Encryption/SPQR/authenticator";
import { expect, test } from "vitest";

let authKey = new Uint8Array(32).fill(41);

test("SPQR authenticator: hdr MAC verifies and rejects tampering", () => {
  let a = Authenticator.newAuth(authKey, 1);
  let hdr = new Uint8Array(64).fill(7);
  let mac = a.macHdr(1, hdr);
  expect(mac.length).toBe(MAC_SIZE);
  expect(a.verifyHdr(1, hdr, mac)).toBe(true);
  let bad = mac.slice();
  bad[0] ^= 1;
  expect(a.verifyHdr(1, hdr, bad)).toBe(false);
  let badHdr = hdr.slice();
  badHdr[0] ^= 1;
  expect(a.verifyHdr(1, badHdr, mac)).toBe(false);
});

test("SPQR authenticator: ct MAC tracks the epoch-secret update", () => {
  let a = Authenticator.newAuth(authKey, 1);
  let b = Authenticator.newAuth(authKey, 1);
  // Both fold in the same epoch secret, so MACs must agree.
  let secret = new Uint8Array(32).fill(3);
  a.update(1, secret);
  b.update(1, secret);
  let ct = new Uint8Array(1120).fill(9);
  let mac = a.macCt(1, ct);
  expect(b.verifyCt(1, ct, mac)).toBe(true);
});

test("SPQR authenticator: different epoch index gives a different MAC", () => {
  let a = Authenticator.newAuth(authKey, 1);
  let hdr = new Uint8Array(64).fill(7);
  expect(a.verifyHdr(2, hdr, a.macHdr(1, hdr))).toBe(false);
});

test("SPQR authenticator: distinct auth keys diverge", () => {
  let a = Authenticator.newAuth(authKey, 1);
  let b = Authenticator.newAuth(new Uint8Array(32).fill(42), 1);
  let hdr = new Uint8Array(64).fill(7);
  expect(b.verifyHdr(1, hdr, a.macHdr(1, hdr))).toBe(false);
});
