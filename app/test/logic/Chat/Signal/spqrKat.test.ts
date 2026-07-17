/** KAT from the real `spqr` crate (v1.5.1): A2B initiator's first message → B2A
 * responder's recv key. Generated via a deterministic harness against the upstream
 * crate (auth_key = [0x29;32]). Verifies our recv matches Signal byte-for-byte. */
import { initialState, recv, Direction } from "../../../../logic/Chat/Signal/Encryption/SPQR/tripleRatchet";
import { hexToBytes, bytesToHex } from "@noble/hashes/utils.js";
import { expect, test } from "vitest";

test("SPQR KAT: B2A recv of spqr's first A2B message yields the reference key", () => {
  let authKey = new Uint8Array(32).fill(0x29);
  let state = initialState({ direction: Direction.B2A, authKey });
  let msg = hexToBytes("0101010100b076fb5c65b9cd783b8b7109428bc44b9251e7fd21e6afd0d9e3190b1d1e2496");
  let out = recv(state, msg);
  console.log("SPQR our recv key:", out.key ? bytesToHex(out.key) : "null");
  expect(out.key ? bytesToHex(out.key) : "null").toBe("9bcdfae095d09aa8ab367dd231d1d271fe580b555bcc6f64ff079d53d9a9db5d");
});
