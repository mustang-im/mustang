import { Statement } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/poksho";
import { ristretto255 } from "@noble/curves/ed25519.js";
import { bytesToHex, bytesToNumberLE } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

let Point = ristretto255.Point;
let Fn = Point.Fn;

function reduce64(b: Uint8Array): bigint {
  return Fn.create(bytesToNumberLE(b));
}
function block(len: number, base: number): Uint8Array {
  return Uint8Array.from({ length: len }, (_, i) => (base + i) & 0xFF);
}

// poksho/src/statement.rs test_statement_encoding.
test("statement description bytes match poksho KATs", () => {
  let s1 = new Statement();
  s1.add("A", [["a", "G"]]);
  expect([...s1.toBytes()]).toEqual([1, 1, 1, 0, 0]);

  let s2 = new Statement();
  s2.add("A", [["a", "G"]]);
  s2.add("B", [["a", "H"]]);
  expect([...s2.toBytes()]).toEqual([2, 1, 1, 0, 0, 2, 1, 0, 3]);

  let s3 = new Statement();
  s3.add("A", [["a", "G"], ["b", "H"]]);
  expect([...s3.toBytes()]).toEqual([1, 1, 2, 0, 0, 1, 2]);
});

// poksho/src/statement.rs test_complex_statement — the committed 160-byte proof.
test("complex statement prove() reproduces the committed proof bytes", () => {
  let a = reduce64(block(64, 10));
  let b = reduce64(block(64, 20));
  let c = reduce64(block(64, 30));
  let d = reduce64(block(64, 40));
  let H = Point.BASE.multiply(reduce64(block(64, 50)));
  let I = Point.BASE.multiply(reduce64(block(64, 60)));

  let A = Point.BASE.multiply(a).add(H.multiply(b)).add(I.multiply(c));
  let B = H.multiply(c).add(I.multiply(d));

  let st = new Statement();
  st.add("A", [["a", "G"], ["b", "H"], ["c", "I"]]);
  st.add("B", [["c", "H"], ["d", "I"]]);
  expect([...st.toBytes()]).toEqual([2, 1, 3, 0, 0, 1, 2, 2, 3, 4, 2, 2, 2, 3, 3]);

  let scalars = new Map([["a", a], ["b", b], ["c", c], ["d", d]]);
  let points = new Map([["A", A], ["B", B], ["H", H], ["I", I]]);
  let proof = st.prove(scalars, points, new Uint8Array(0), block(32, 0));

  let expected =
    "8efc676c33e6b2d0670ed5461a507f6a4bc9153e261db80fa438f3cd80a5c909" +
    "b113cc0d7990ad616d0a2fc4b831d06357a5ee5d36d44b3427c790106118 0c0f".replace(/ /g, "") +
    "b1798c51680fe21b9f98e97955b1597c49314725c1546a369328cf54daae710b" +
    "fc4a9911422aa77ed6d7231de3003ba5ae9d9fd0c53ced7ad782e29b04684a07" +
    "221a6ef47ce61d817f01117cf59df69ac35b5bb590f1f7b6d029717bc1a62501";
  expect(bytesToHex(proof)).toBe(expected);

  expect(st.verify(proof, points, new Uint8Array(0))).toBe(true);
  expect(st.verify(proof, points, block(32, 0))).toBe(false); // wrong message
});
