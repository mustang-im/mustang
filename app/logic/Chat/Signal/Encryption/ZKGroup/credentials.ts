/** zkcredential KVAC credentials — the algebraic-MAC auth credential layer
 * (libsignal `zkcredential/src/{credentials,issuance}.rs`,
 * `zkgroup/src/api/{server_params,auth/.../zkc}.rs`).
 *
 * The issuing chat server holds a CredentialKeyPair and issues an
 * AuthCredentialWithPni: an algebraic MAC `(t, U, V)` over the ACI, PNI, and
 * redemption-time attributes, plus a zero-knowledge issuance proof. The client
 * verifies the proof and stores the credential; later it builds a presentation
 * (see presentation.ts) as the group-server Authorization.
 *
 * The 13 KVAC system generator points are generated in libsignal by a *non-HMAC*
 * SHO variant (ShoSha256) which we don't port; instead we use the published
 * hardcoded serialization (credentials.rs SYSTEM_HARDCODED) and parse it. */
import { ristretto255 } from "@noble/curves/ed25519.js";
import { hexToBytes } from "@noble/curves/utils.js";
import { Sho } from "./sho";
import { Statement } from "./poksho";
import { Writer, Reader, u64BE } from "./serialize";
import { ServiceId } from "../../ServiceId";
import { uidStructPoints } from "./groupParams";

const Point = ristretto255.Point;
const Fn = Point.Fn;
type Pt = InstanceType<typeof Point>;

export const CREDENTIAL_LABEL = "20240222_Signal_AuthCredentialZkc";
export const AUTH_CREDENTIAL_WITH_PNI_VERSION_ZKC = 0x03;

/** Number of supported attribute points: 1 aggregate public + up to 3 two-point hidden. */
const NUM_SUPPORTED_ATTRS = 7;

// --- KVAC system params (13 points) ---

/** Hardcoded zkcredential system params (credentials.rs SYSTEM_HARDCODED):
 * G_w, G_wprime, G_x0, G_x1, G_V, G_z, G_y[0..7]. 13 × 32 bytes. */
const SYSTEM_HARDCODED = hexToBytes(
  "589c8718e8263a53a78932b6212a46e7fd52de3ad157b5bb277dba494cfd3471" +
  "d4cc5f90685952917b33366efcce0512a1f8d70f974758266cb04fc424346d37" +
  "b20f49cb2a081c94b1771fd8c172ae21785c61ea2c7e31947ce351e7b5ff0702" +
  "8c5329beb87b317ffcd981e440819d91136c988d6d9fbea4a87e55ed24a5993a" +
  "a02f688ab1d3bd19056f94c8a44b8faddfa3c9c79c95ad44311a7bf00e5e862e" +
  "c2c399f0d689dfb8c2dc0d7caba32afcf58cf0d85f78195a0b5ab732f5655954" +
  "92cfd982321d1f9be4b21fe6a0214306023d6a05d0d23f67ddc1c0400e5e0a5e" +
  "92d17595131b7a095e740b884b8c9bb0226a39cfd027c769c4f4677c51f21b24" +
  "da81fb2bd1356a9d0650f6a63fcc90d93bd74a954ba6f75f0e9fca47a6d21734" +
  "bce7b28f06b76ef2c44d20a07026534e586eb8e1038874a93e44de362ce7bc08" +
  "44bffc88e390c62519e281aa6fd53ff9ddd1d9ba303cf70004278ea2ae66ce05" +
  "a2749d29eba56f3efe99e42902825c473dfc3c154c3762d2e76bd103f629d250" +
  "b2d9d5c243a4cf8f3be21a84f153f44e2733a105cf780a20f03d84fe1ebbeb0e");

export interface KvacSystemParams {
  Gw: Pt; Gwprime: Pt; Gx0: Pt; Gx1: Pt; GV: Pt; Gz: Pt; Gy: Pt[];
}

function loadSystemParams(): KvacSystemParams {
  let pts: Pt[] = [];
  for (let i = 0; i < 13; i++) {
    pts.push(Point.fromBytes(SYSTEM_HARDCODED.subarray(i * 32, i * 32 + 32)));
  }
  return { Gw: pts[0], Gwprime: pts[1], Gx0: pts[2], Gx1: pts[3], GV: pts[4], Gz: pts[5], Gy: pts.slice(6, 13) };
}

export const kvacSystem = loadSystemParams();

// --- credential key pair ---

/** The issuing server's private MAC key. */
export class CredentialPrivateKey {
  constructor(
    readonly w: bigint, readonly wprime: bigint, readonly W: Pt,
    readonly x0: bigint, readonly x1: bigint, readonly y: bigint[],
  ) {}

  /** Derive the key from raw randomness (server_params.rs uses the bare 32 bytes). */
  static generate(randomness: Uint8Array): CredentialPrivateKey {
    let sho = new Sho("Signal_ZKCredential_CredentialPrivateKey_generate_20230410");
    sho.absorbAndRatchet(randomness);
    let w = sho.getScalar();
    let W = kvacSystem.Gw.multiply(w);
    let wprime = sho.getScalar();
    let x0 = sho.getScalar();
    let x1 = sho.getScalar();
    let y: bigint[] = [];
    for (let i = 0; i < NUM_SUPPORTED_ATTRS; i++) {
      y.push(sho.getScalar());
    }
    return new CredentialPrivateKey(w, wprime, W, x0, x1, y);
  }

  publicKey(): CredentialPublicKey {
    let CW = this.W.add(kvacSystem.Gwprime.multiply(this.wprime));
    let Ii = kvacSystem.GV.subtract(kvacSystem.Gx0.multiply(this.x0)).subtract(kvacSystem.Gx1.multiply(this.x1));
    Ii = Ii.subtract(kvacSystem.Gy[0].multiply(this.y[0]));
    // I_n for n = 2..NUM_SUPPORTED_ATTRS (skip I_0, I_1).
    let I: Pt[] = [];
    for (let i = 1; i < NUM_SUPPORTED_ATTRS; i++) {
      Ii = Ii.subtract(kvacSystem.Gy[i].multiply(this.y[i]));
      I.push(Ii);
    }
    return new CredentialPublicKey(CW, I);
  }
}

/** The client-held public key used to verify issuance and build presentations. */
export class CredentialPublicKey {
  /** @param I I[k] = I_(k+2), the issuing parameter for k+2 total attribute points. */
  constructor(readonly CW: Pt, readonly I: Pt[]) {}

  /** The I point for `numAttrs` total attribute points (≥ 2). */
  pointI(numAttrs: number): Pt {
    return this.I[numAttrs - 2];
  }
}

export class CredentialKeyPair {
  constructor(readonly privateKey: CredentialPrivateKey, readonly publicKey: CredentialPublicKey) {}

  static generate(randomness: Uint8Array): CredentialKeyPair {
    let priv = CredentialPrivateKey.generate(randomness);
    return new CredentialKeyPair(priv, priv.publicKey());
  }
}

/** The issuing chat server's secret params. For the auth-credential path the only
 * relevant member is `genericCredentialKeyPair`, which libsignal generates directly
 * from the raw randomness (server_params.rs:96), independent of the older
 * Sho-derived key pairs. */
export class ServerSecretParams {
  constructor(readonly genericCredentialKeyPair: CredentialKeyPair) {}

  static generate(randomness: Uint8Array): ServerSecretParams {
    return new ServerSecretParams(CredentialKeyPair.generate(randomness));
  }

  getPublicParams(): ServerPublicParams {
    return new ServerPublicParams(this.genericCredentialKeyPair.publicKey);
  }
}

/** The chat server's public params; clients use `genericCredentialPublicKey` to
 * verify issuance and build presentations. */
export class ServerPublicParams {
  constructor(readonly genericCredentialPublicKey: CredentialPublicKey) {}

  /** Parse a libsignal-serialized `ServerPublicParams` blob (673 bytes, the
   * production `ZKGROUP_SERVER_PUBLIC_PARAMS`). Bincode field layout (server_params.rs):
   * reserved(1) + 7 legacy/sig public keys + generic_credential_public_key(224) +
   * endorsement(32). Only `generic_credential_public_key` is needed for the auth
   * credential, at offset 417: C_W(32) ‖ I[6]×32 (I_2..I_7). */
  static deserialize(bytes: Uint8Array): ServerPublicParams {
    if (bytes.length != kServerPublicParamsLen) {
      throw new Error(`ServerPublicParams: expected ${kServerPublicParamsLen} bytes, got ${bytes.length}`);
    }
    let off = kGenericCredentialPublicKeyOffset;
    let CW = Point.fromBytes(bytes.subarray(off, off + 32));
    let I: Pt[] = [];
    for (let i = 0; i < 6; i++) {
      let p = off + 32 + i * 32;
      I.push(Point.fromBytes(bytes.subarray(p, p + 32)));
    }
    return new ServerPublicParams(new CredentialPublicKey(CW, I));
  }
}

/** Serialized `ServerPublicParams` length and the offset of its
 * `generic_credential_public_key` (see ServerPublicParams.deserialize). */
const kServerPublicParamsLen = 673;
const kGenericCredentialPublicKeyOffset = 1 + 64 + 64 + 32 + 64 + 64 + 64 + 64; // = 417

/** The MAC itself: `(t, U, V)`. */
export interface Credential {
  t: bigint;
  U: Pt;
  V: Pt;
}

// --- attributes ---

/** An attribute as its two Ristretto points. */
export interface Attribute {
  points(): [Pt, Pt];
}

/** Hash a public attribute (u64 redemption time, big-endian) into a SHO. */
function hashU64Into(sho: Sho, value: number | bigint): void {
  sho.absorbAndRatchet(u64BE(value));
}

/** The aggregate public-attribute point: the SHO over the credential label and
 * all public attributes, mapped to a point (issuance.rs finalize_public_attrs). */
function publicAttributePoint(label: string, redemptionTime: number | bigint): Pt {
  let sho = new Sho(label);
  hashU64Into(sho, redemptionTime);
  return sho.getPoint();
}

// --- the issuance proof statement (shared by issue + verify) ---

/** poksho statement proving the server knows a key producing this MAC
 * (issuance.rs get_poksho_statement), for `numAttrPoints` total attribute points. */
function issuanceStatement(numAttrPoints: number): Statement {
  let st = new Statement();
  st.add("C_W", [["w", "G_w"], ["wprime", "G_wprime"]]);

  let gviTerms: [string, string][] = [["x0", "G_x0"], ["x1", "G_x1"]];
  for (let i = 0; i < numAttrPoints; i++) {
    gviTerms.push([`y${i}`, `G_y${i}`]);
  }
  st.add("G_V-I", gviTerms);

  let vTerms: [string, string][] = [["w", "G_w"], ["x0", "U"], ["x1", "tU"]];
  for (let i = 0; i < numAttrPoints; i++) {
    vTerms.push([`y${i}`, `M${i}`]);
  }
  st.add("V", vTerms);
  return st;
}

function issuanceScalarArgs(key: CredentialKeyPair, numAttrPoints: number): Map<string, bigint> {
  let m = new Map<string, bigint>();
  m.set("w", key.privateKey.w);
  m.set("wprime", key.privateKey.wprime);
  m.set("x0", key.privateKey.x0);
  m.set("x1", key.privateKey.x1);
  for (let i = 0; i < numAttrPoints; i++) {
    m.set(`y${i}`, key.privateKey.y[i]);
  }
  return m;
}

function issuancePointArgs(pub: CredentialPublicKey, attrPoints: Pt[], credential: Credential): Map<string, Pt> {
  let m = new Map<string, Pt>();
  m.set("C_W", pub.CW);
  m.set("G_w", kvacSystem.Gw);
  m.set("G_wprime", kvacSystem.Gwprime);
  m.set("G_V-I", kvacSystem.GV.subtract(pub.pointI(attrPoints.length)));
  m.set("G_x0", kvacSystem.Gx0);
  m.set("G_x1", kvacSystem.Gx1);
  for (let i = 0; i < attrPoints.length; i++) {
    m.set(`G_y${i}`, kvacSystem.Gy[i]);
  }
  m.set("V", credential.V);
  m.set("U", credential.U);
  m.set("tU", credential.U.multiply(credential.t));
  for (let i = 0; i < attrPoints.length; i++) {
    m.set(`M${i}`, attrPoints[i]);
  }
  return m;
}

/** Builds the full attribute-point list for the auth credential:
 * [aggregatePublic, aci.M1, aci.M2, pni.M1, pni.M2]. */
function authAttributePoints(aci: ServiceId, pni: ServiceId, redemptionTime: number | bigint): Pt[] {
  let a = uidStructPoints(aci);
  let p = uidStructPoints(pni);
  return [publicAttributePoint(CREDENTIAL_LABEL, redemptionTime), a.M1, a.M2, p.M1, p.M2];
}

// --- issuance (server) + receive/verify (client) ---

export interface IssuanceProof {
  credential: Credential;
  pokshoProof: Uint8Array;
}

/** SERVER: issue an AuthCredentialWithPni over (aci, pni, redemptionTime). */
export function issueAuthCredential(
  key: CredentialKeyPair, aci: ServiceId, pni: ServiceId, redemptionTime: number | bigint, randomness: Uint8Array,
): IssuanceProof {
  let attrPoints = authAttributePoints(aci, pni, redemptionTime);

  let sho = new Sho("Signal_ZKCredential_Issuance_20230410");
  sho.absorbAndRatchet(randomness);
  let credential = credentialCore(key.privateKey, attrPoints, sho);

  let proofRandomness = sho.squeezeAndRatchet(32);
  let proof = issuanceStatement(attrPoints.length).prove(
    issuanceScalarArgs(key, attrPoints.length),
    issuancePointArgs(key.publicKey, attrPoints, credential),
    new Uint8Array(0),
    proofRandomness,
  );
  return { credential, pokshoProof: proof };
}

/** The algebraic MAC: t,U from the SHO, V = W + (x0 + x1·t)·U + Σ y_i·M_i. */
function credentialCore(priv: CredentialPrivateKey, M: Pt[], sho: Sho): Credential {
  let t = sho.getScalar();
  let U = sho.getPoint();
  let V = priv.W.add(U.multiply(Fn.add(priv.x0, Fn.mul(priv.x1, t))));
  for (let i = 0; i < M.length; i++) {
    V = V.add(M[i].multiply(priv.y[i]));
  }
  return { t, U, V };
}

/** A received, verified AuthCredentialWithPni stored by the client. */
export class AuthCredentialWithPni {
  constructor(
    readonly credential: Credential,
    readonly aci: ServiceId,
    readonly pni: ServiceId,
    readonly redemptionTime: number | bigint,
  ) {}

  /** Bincode: version(1) + credential(t,U,V) + aci UidStruct(80) + pni UidStruct(80) + redemptionTime(u64 LE). */
  serialize(): Uint8Array {
    let w = new Writer();
    w.u8(AUTH_CREDENTIAL_WITH_PNI_VERSION_ZKC);
    w.scalar(this.credential.t).point(this.credential.U).point(this.credential.V);
    serializeUidStruct(w, this.aci);
    serializeUidStruct(w, this.pni);
    w.u64(this.redemptionTime);
    return w.finish();
  }
}

/** UidStruct bincode: raw_uuid(16) + M1(32) + M2(32) = 80 bytes. */
function serializeUidStruct(w: Writer, serviceId: ServiceId): void {
  let { M1, M2 } = uidStructPoints(serviceId);
  w.bytes(serviceId.uuid).point(M1).point(M2);
}

/** CLIENT: verify the issuance proof and return the stored credential.
 * `receiveAuthCredentialWithPniZkc` in libsignal. Throws on failure. */
export function receiveAuthCredentialWithPniZkc(
  responseBytes: Uint8Array, pub: CredentialPublicKey,
  aci: ServiceId, pni: ServiceId, redemptionTime: number | bigint,
): AuthCredentialWithPni {
  if (BigInt(redemptionTime) % 86400n != 0n) {
    throw new Error("redemption time must be day-aligned");
  }
  let proof = parseIssuanceResponse(responseBytes);
  let attrPoints = authAttributePoints(aci, pni, redemptionTime);

  let ok = issuanceStatement(attrPoints.length).verify(
    proof.pokshoProof,
    issuancePointArgs(pub, attrPoints, proof.credential),
    new Uint8Array(0),
  );
  if (!ok) {
    throw new Error("issuance proof verification failed");
  }
  return new AuthCredentialWithPni(proof.credential, aci, pni, redemptionTime);
}

/** Parse AuthCredentialWithPniZkcResponse: version(1) + Credential(96) + Vec<u8> poksho proof. */
export function parseIssuanceResponse(bytes: Uint8Array): IssuanceProof {
  let r = new Reader(bytes);
  r.versionByte(AUTH_CREDENTIAL_WITH_PNI_VERSION_ZKC);
  let t = r.scalar();
  let U = r.point();
  let V = r.point();
  let pokshoProof = r.byteVec();
  r.end();
  return { credential: { t, U, V }, pokshoProof };
}

/** Serialize an IssuanceProof to the AuthCredentialWithPniZkcResponse wire form (for tests). */
export function serializeIssuanceResponse(proof: IssuanceProof): Uint8Array {
  let w = new Writer();
  w.u8(AUTH_CREDENTIAL_WITH_PNI_VERSION_ZKC);
  w.scalar(proof.credential.t).point(proof.credential.U).point(proof.credential.V);
  w.byteVec(proof.pokshoProof);
  return w.finish();
}
