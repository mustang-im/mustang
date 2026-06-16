/** ShoHmacSha256 — Signal's "Stateful Hash Object", the random-oracle backbone of
 * zkgroup (generator derivation, credential MACs, sigma-proof transcripts).
 * Clean-room port of libsignal `poksho/src/shohmacsha256.rs`.
 *
 *   new(label)         : cv = 0³²; absorbAndRatchet(label)
 *   absorb(x)          : buffer x (HMAC keyed with the current cv)
 *   ratchet()          : cv = HMAC-SHA256(cv, buffered ‖ 0x00); clear buffer
 *   squeezeAndRatchet(n): out[i-th 32B block] = HMAC-SHA256(cv, be64(i) ‖ 0x01);
 *                         then cv = HMAC-SHA256(cv, be64(n) ‖ 0x02)
 *
 * Verified against the poksho test vectors (see sho.test.ts). */
import { hmacSHA256, concatBytes } from "../../Crypto/primitives";
import { ristretto255 } from "@noble/curves/ed25519.js";
import { bytesToNumberLE } from "@noble/curves/utils.js";
import { elligatorFromBytes } from "./ristretto";

const Point = ristretto255.Point;
/** Scalar field of the Ristretto group (order ℓ). */
const Fn = Point.Fn;

function be64(n: number): Uint8Array {
  let out = new Uint8Array(8);
  let v = BigInt(n);
  for (let i = 7; i >= 0; i--) {
    out[i] = Number(v & 0xFFn);
    v >>= 8n;
  }
  return out;
}

export class Sho {
  private cv: Uint8Array = new Uint8Array(32);
  private buffer: number[] = [];
  private absorbing = false;

  constructor(label: Uint8Array | string) {
    this.absorbAndRatchet(typeof label == "string" ? new TextEncoder().encode(label) : label);
  }

  /** A deep copy of the current state. poksho's sigma-proof prover clones the
   * transcript SHO after absorbing the statement + points (statement.rs:198). */
  clone(): Sho {
    let copy = Object.create(Sho.prototype) as Sho;
    copy.cv = this.cv.slice();
    copy.buffer = this.buffer.slice();
    copy.absorbing = this.absorbing;
    return copy;
  }

  absorb(input: Uint8Array): void {
    this.absorbing = true;
    for (let b of input) {
      this.buffer.push(b);
    }
  }

  ratchet(): void {
    if (!this.absorbing) {
      return;
    }
    this.buffer.push(0x00);
    this.cv = hmacSHA256(this.cv, Uint8Array.from(this.buffer));
    this.buffer = [];
    this.absorbing = false;
  }

  absorbAndRatchet(input: Uint8Array): void {
    this.absorb(input);
    this.ratchet();
  }

  squeezeAndRatchet(outlen: number): Uint8Array {
    let out = new Uint8Array(outlen);
    let offset = 0;
    for (let i = 0; offset < outlen; i++) {
      let block = hmacSHA256(this.cv, concatBytes(be64(i), new Uint8Array([0x01])));
      let n = Math.min(32, outlen - offset);
      out.set(block.subarray(0, n), offset);
      offset += n;
    }
    this.cv = hmacSHA256(this.cv, concatBytes(be64(outlen), new Uint8Array([0x02])));
    return out;
  }

  // --- zkgroup derivations (common/sho.rs) ---

  /** A scalar in [0, ℓ): 64 squeezed bytes reduced mod the group order
   * (`Scalar::from_bytes_mod_order_wide`). */
  getScalar(): bigint {
    return Fn.create(bytesToNumberLE(this.squeezeAndRatchet(64)));
  }

  /** A Ristretto point via the standard two-Elligator map
   * (`RistrettoPoint::from_uniform_bytes` of 64 squeezed bytes). */
  getPoint(): InstanceType<typeof Point> {
    let b = this.squeezeAndRatchet(64);
    return elligatorFromBytes(b.subarray(0, 32)).add(elligatorFromBytes(b.subarray(32, 64)));
  }

  /** A Ristretto point via a single Elligator call (32 squeezed bytes). */
  getPointSingleElligator(): InstanceType<typeof Point> {
    return elligatorFromBytes(this.squeezeAndRatchet(32));
  }
}
