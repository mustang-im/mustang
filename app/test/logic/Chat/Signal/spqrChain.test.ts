import { Chain, Direction, DEFAULT_CHAIN_PARAMS, SPQRError } from "../../../../logic/Chat/Signal/Encryption/SPQR/chain";
import { expect, test } from "vitest";

function eq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length != b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}

// KAT from chain.rs:463-487 (directions_match): with initial_key=b"1", A2B
// send_key(0) returns index 1 and a key equal to B2A recv_key(0,1); after
// add_epoch(1,[2]) both, send_key(1) index 1 == recv_key(1,1); the 10th
// send_key(1) is index 10 == recv_key(1,10). Anchors the chain KDF labels and
// the double-space "Chain  Start".
test("SPQR chain: send/recv directions produce identical keys", () => {
  let one = new TextEncoder().encode("1");
  let a2b = Chain.newChain(one, Direction.A2B, DEFAULT_CHAIN_PARAMS);
  let b2a = Chain.newChain(one, Direction.B2A, DEFAULT_CHAIN_PARAMS);

  let sk1 = a2b.sendKey(0);
  expect(sk1.index).toBe(1);
  expect(eq(sk1.key, b2a.recvKey(0, 1))).toBe(true);

  a2b.addEpoch({ epoch: 1, secret: new Uint8Array([2]) });
  b2a.addEpoch({ epoch: 1, secret: new Uint8Array([2]) });

  let sk2 = a2b.sendKey(1);
  expect(sk2.index).toBe(1);
  expect(eq(sk2.key, b2a.recvKey(1, 1))).toBe(true);

  for (let i = 2; i < 10; i++) {
    a2b.sendKey(1);
  }
  let sk3 = a2b.sendKey(1);
  expect(sk3.index).toBe(10);
  expect(eq(sk3.key, b2a.recvKey(1, 10))).toBe(true);
});

// chain.rs:489-497 — a previously returned key is not returned again.
test("SPQR chain: re-requesting a delivered key errors", () => {
  let one = new TextEncoder().encode("1");
  let a2b = Chain.newChain(one, Direction.A2B, DEFAULT_CHAIN_PARAMS);
  a2b.recvKey(0, 2);
  expect(() => a2b.recvKey(0, 2)).toThrow(SPQRError);
});

// chain.rs:499-510 — very old out-of-order keys are trimmed.
test("SPQR chain: very old keys are trimmed", () => {
  let one = new TextEncoder().encode("1");
  let params = { maxJump: 10, maxOOOKeys: 10 };
  let a2b = Chain.newChain(one, Direction.A2B, params);
  a2b.recvKey(0, 10);
  a2b.recvKey(0, 12);
  expect(() => a2b.recvKey(0, 1)).toThrow(/trimmed/);
});

// chain.rs:512-526 — many out-of-order keys all recoverable when shuffled.
test("SPQR chain: out-of-order keys all recover (shuffled)", () => {
  let one = new TextEncoder().encode("1");
  let a2b = Chain.newChain(one, Direction.A2B, DEFAULT_CHAIN_PARAMS);
  let b2a = Chain.newChain(one, Direction.B2A, DEFAULT_CHAIN_PARAMS);
  let keys: { index: number; key: Uint8Array }[] = [];
  for (let i = 0; i < 100; i++) {
    keys.push(a2b.sendKey(0));
  }
  for (let i = keys.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  for (let k of keys) {
    expect(eq(b2a.recvKey(0, k.index), k.key)).toBe(true);
  }
});

// chain.rs:528-542 — send_key epoch may not decrease.
test("SPQR chain: send_key epoch decrease errors", () => {
  let one = new TextEncoder().encode("1");
  let a2b = Chain.newChain(one, Direction.A2B, DEFAULT_CHAIN_PARAMS);
  a2b.sendKey(0);
  a2b.sendKey(0);
  a2b.addEpoch({ epoch: 1, secret: new Uint8Array([2]) });
  a2b.sendKey(1);
  expect(() => a2b.sendKey(0)).toThrow(/decreased/);
});

test("SPQR chain: serialize round-trip preserves key stream", () => {
  let one = new TextEncoder().encode("1");
  let a2b = Chain.newChain(one, Direction.A2B, DEFAULT_CHAIN_PARAMS);
  let b2a = Chain.newChain(one, Direction.B2A, DEFAULT_CHAIN_PARAMS);
  a2b.sendKey(0);
  a2b.addEpoch({ epoch: 1, secret: new Uint8Array([9, 9, 9]) });
  b2a.addEpoch({ epoch: 1, secret: new Uint8Array([9, 9, 9]) });
  let restored = Chain.deserialize(a2b.serialize());
  let sk = restored.sendKey(1);
  expect(eq(sk.key, b2a.recvKey(1, sk.index))).toBe(true);
});
