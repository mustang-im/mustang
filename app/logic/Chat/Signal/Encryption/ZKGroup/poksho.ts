/** poksho — the Fiat–Shamir sigma proof over Ristretto255 (libsignal
 * `poksho/src/{statement,proof,args}.rs`).
 *
 * Proves knowledge of scalars satisfying a system of linear group equations
 *   LHS_point = Σ scalar_i · point_i
 * without revealing the scalars. The proof is a compact Schnorr signature:
 * `challenge(32) ‖ response_0(32) ‖ response_1(32) ‖ …`, each a canonical LE scalar.
 *
 * Variables are referred to by name; indices are assigned by first appearance,
 * and point index 0 is pre-bound to the Ristretto base point. The statement's
 * index structure is hashed into the transcript (`to_bytes`), so the proof is
 * bound to the exact equation shape. Verified against poksho's committed KAT. */
import { ristretto255 } from "@noble/curves/ed25519.js";
import { bytesToNumberLE } from "@noble/curves/utils.js";
import { Sho } from "./sho";
import { scalarToBytes } from "./serialize";

const Point = ristretto255.Point;
const Fn = Point.Fn;
type Pt = InstanceType<typeof Point>;

interface Term {
  scalar: number; // scalar index
  point: number;  // point index
}
interface Equation {
  lhs: number;    // point index of the LHS
  rhs: Term[];
}

/** Reduce 64 little-endian bytes mod ℓ (`Scalar::from_bytes_mod_order_wide`). */
function reduce64(b: Uint8Array): bigint {
  return Fn.create(bytesToNumberLE(b));
}

export class Statement {
  private equations: Equation[] = [];
  private scalarNames: string[] = [];
  private scalarIndex = new Map<string, number>();
  private pointNames: string[] = ["G"]; // index 0 = base point
  private pointIndex = new Map<string, number>([["G", 0]]);

  private addScalar(name: string): number {
    let idx = this.scalarIndex.get(name);
    if (idx !== undefined) {
      return idx;
    }
    idx = this.scalarNames.length;
    this.scalarIndex.set(name, idx);
    this.scalarNames.push(name);
    return idx;
  }

  private addPoint(name: string): number {
    let idx = this.pointIndex.get(name);
    if (idx !== undefined) {
      return idx;
    }
    idx = this.pointNames.length;
    this.pointIndex.set(name, idx);
    this.pointNames.push(name);
    return idx;
  }

  /** Adds an equation `lhs = Σ (scalar·point)`. Order-sensitive. */
  add(lhs: string, rhs: [string, string][]): void {
    let lhsIdx = this.addPoint(lhs);
    let terms = rhs.map(([s, p]) => ({ scalar: this.addScalar(s), point: this.addPoint(p) }));
    this.equations.push({ lhs: lhsIdx, rhs: terms });
  }

  /** The statement description `D`: equation count, then per equation the LHS
   * point index, term count, and (scalarIndex, pointIndex) per term. */
  toBytes(): Uint8Array {
    let v: number[] = [this.equations.length];
    for (let eq of this.equations) {
      v.push(eq.lhs);
      v.push(eq.rhs.length);
      for (let t of eq.rhs) {
        v.push(t.scalar);
        v.push(t.point);
      }
    }
    return Uint8Array.from(v);
  }

  /** All point values in index order, index 0 = base point. */
  private sortPoints(points: Map<string, Pt>): Pt[] {
    let out: Pt[] = [Point.BASE];
    for (let i = 1; i < this.pointNames.length; i++) {
      let p = points.get(this.pointNames[i]);
      if (!p) {
        throw new Error(`missing point arg: ${this.pointNames[i]}`);
      }
      out.push(p);
    }
    return out;
  }

  /** All scalar values in index order. */
  private sortScalars(scalars: Map<string, bigint>): bigint[] {
    return this.scalarNames.map(name => {
      let s = scalars.get(name);
      if (s === undefined) {
        throw new Error(`missing scalar arg: ${name}`);
      }
      return s;
    });
  }

  /** Applies the homomorphism F to a scalar vector; with a challenge h also
   * subtracts h·LHS per equation (for commitment recovery in verification). */
  private homomorphism(g1: bigint[], allPoints: Pt[], challenge: bigint | null): Pt[] {
    return this.equations.map(eq => {
      let acc = Point.ZERO;
      for (let t of eq.rhs) {
        acc = acc.add(allPoints[t.point].multiply(g1[t.scalar]));
      }
      if (challenge !== null) {
        let negH = Fn.create(-challenge);
        // multiply may reject zero scalar; guard the (degenerate) zero case.
        if (negH != 0n) {
          acc = acc.add(allPoints[eq.lhs].multiply(negH));
        }
      }
      return acc;
    });
  }

  /** Generates a proof. `randomness` must be 32 bytes. */
  prove(scalars: Map<string, bigint>, points: Map<string, Pt>, message: Uint8Array, randomness: Uint8Array): Uint8Array {
    if (randomness.length != 32) {
      throw new Error("randomness must be 32 bytes");
    }
    let g1 = this.sortScalars(scalars);
    let allPoints = this.sortPoints(points);

    // Absorb label L, statement D, and point values A; ratchet once.
    let sho = new Sho("POKSHO_Ristretto_SHOHMACSHA256");
    sho.absorb(this.toBytes());
    for (let p of allPoints) {
      sho.absorb(p.toBytes());
    }
    sho.ratchet();

    // Synthetic nonce: clone, absorb randomness ‖ witness, ratchet, absorb message.
    let sho2 = sho.clone();
    sho2.absorb(randomness);
    for (let s of g1) {
      sho2.absorb(scalarToBytes(s));
    }
    sho2.ratchet();
    sho2.absorbAndRatchet(message);
    let nonceBytes = sho2.squeezeAndRatchet(g1.length * 64);
    let nonce: bigint[] = [];
    for (let i = 0; i < g1.length; i++) {
      nonce.push(reduce64(nonceBytes.subarray(i * 64, i * 64 + 64)));
    }

    // Commitment R = F(nonce); absorb R ‖ message; challenge = reduce64(squeeze 64).
    let commitment = this.homomorphism(nonce, allPoints, null);
    for (let p of commitment) {
      sho.absorb(p.toBytes());
    }
    sho.absorbAndRatchet(message);
    let challenge = reduce64(sho.squeezeAndRatchet(64));

    // Response_i = nonce_i + g1_i·challenge.
    let response = nonce.map((n, i) => Fn.add(n, Fn.mul(g1[i], challenge)));

    let proof = serializeProof(challenge, response);
    // Self-check before returning (a faulty response could leak the witness).
    if (!this.verify(proof, points, message)) {
      throw new Error("proof failed self-verification");
    }
    return proof;
  }

  /** Verifies a proof against the point assignments and message. */
  verify(proof: Uint8Array, points: Map<string, Pt>, message: Uint8Array): boolean {
    let parsed = parseProof(proof);
    if (!parsed || parsed.response.length != this.scalarNames.length) {
      return false;
    }
    let { challenge, response } = parsed;
    let allPoints = this.sortPoints(points);

    let sho = new Sho("POKSHO_Ristretto_SHOHMACSHA256");
    sho.absorb(this.toBytes());
    for (let p of allPoints) {
      sho.absorb(p.toBytes());
    }
    sho.ratchet();

    // R = F(response) − challenge·A.
    let commitment = this.homomorphism(response, allPoints, challenge);
    for (let p of commitment) {
      sho.absorb(p.toBytes());
    }
    sho.absorbAndRatchet(message);
    let recomputed = reduce64(sho.squeezeAndRatchet(64));
    return recomputed == challenge;
  }
}

/** Proof bytes = challenge(32) ‖ response_0(32) ‖ …, canonical LE scalars. */
function serializeProof(challenge: bigint, response: bigint[]): Uint8Array {
  let scalars = [challenge, ...response];
  let out = new Uint8Array(scalars.length * 32);
  scalars.forEach((s, i) => out.set(scalarToBytes(s), i * 32));
  return out;
}

function parseProof(bytes: Uint8Array): { challenge: bigint, response: bigint[] } | null {
  if (bytes.length == 0 || bytes.length % 32 != 0) {
    return null;
  }
  let scalars: bigint[] = [];
  for (let i = 0; i < bytes.length; i += 32) {
    let chunk = bytes.subarray(i, i + 32);
    let n = bytesToNumberLE(chunk);
    if (n >= Fn.ORDER) {
      return null; // non-canonical
    }
    scalars.push(n);
  }
  let challenge = scalars[0];
  let response = scalars.slice(1);
  if (response.length == 0) {
    return null;
  }
  return { challenge, response };
}
