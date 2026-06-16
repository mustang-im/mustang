/** AuthCredentialWithPni presentation — the zero-knowledge proof sent to the
 * group server as the Authorization (libsignal `zkcredential/src/presentation.rs`,
 * `zkgroup/.../auth/.../zkc.rs`).
 *
 * The client proves, without revealing the ACI/PNI, that it holds a credential
 * `(t,U,V)` issued by the chat server for those identities at `redemptionTime`,
 * and that the supplied UID ciphertexts are correct encryptions under the group's
 * uid-encryption key. The group server (which holds the issuing MAC private key)
 * verifies the proof — "keyed-verification".
 *
 * For the auth credential the two hidden attributes (aci, pni) are both encrypted
 * under the *same* group uid key, so the encryption-key set has a single entry. */
import { ristretto255 } from "@noble/curves/ed25519.js";
import { Statement } from "./poksho";
import { Writer, Reader } from "./serialize";
import {
  CredentialKeyPair, CredentialPublicKey, AuthCredentialWithPni,
  kvacSystem, CREDENTIAL_LABEL, AUTH_CREDENTIAL_WITH_PNI_VERSION_ZKC,
} from "./credentials";
import {
  GroupSecretParams, GroupPublicParams,
  uidStructPoints, uidEncryptionGenerators,
} from "./groupParams";
import type { KvacCiphertext } from "./groupParams";
import { u64BE } from "./serialize";
import { Sho } from "./sho";

const Point = ristretto255.Point;
const Fn = Point.Fn;
type Pt = InstanceType<typeof Point>;

/** The uid-encryption domain ID — the `key_id` woven into presentation labels. */
export const UID_ENCRYPTION_DOMAIN_ID = "Signal_ZKGroup_20230419_UidEncryption";

const PRESENTATION_VERSION_4 = AUTH_CREDENTIAL_WITH_PNI_VERSION_ZKC; // 0x03

/** A presented attribute: the indices of its two points and whether it's encrypted. */
interface AttrRef {
  encrypted: boolean;
  first: number;
  second: number;
}

/** Builds the poksho statement for a presentation with the given attributes,
 * all encrypted under a single key whose id is `keyId` (presentation.rs
 * get_poksho_statement). attr_points layout: [public, then 2 points/attribute]. */
function presentationStatement(attrs: AttrRef[], keyId: string): Statement {
  let st = new Statement();
  st.add("Z", [["z", "I"]]);
  st.add("C_x1", [["t", "C_x0"], ["z0", "G_x0"], ["z", "G_x1"]]);

  // Encryption-key validity (Trevor Perrin's addition): one key here.
  st.add("0", [[`z1_${keyId}`, "I"], [`a1_${keyId}`, "Z"]]);
  st.add("sum(A)", [[`a1_${keyId}`, `G_a1_${keyId}`], [`a2_${keyId}`, `G_a2_${keyId}`]]);

  for (let attr of attrs) {
    // E_A1 = a1·C_y1 + z1·G_y1
    st.add(`E_A${attr.first}`, [
      [`a1_${keyId}`, `C_y${attr.first}`],
      [`z1_${keyId}`, `G_y${attr.first}`],
    ]);
    // C_y2 − E_A2 = z·G_y2 + a2·(−E_A1)
    st.add(`C_y${attr.second}-E_A${attr.second}`, [
      ["z", `G_y${attr.second}`],
      [`a2_${keyId}`, `-E_A${attr.first}`],
    ]);
  }

  // Point 0 is the hardcoded public attribute: C_y0 = z·G_y0.
  st.add("C_y0", [["z", "G_y0"]]);
  return st;
}

/** Points not derived per-attribute (prepare_non_attribute_point_args). */
function nonAttributePointArgs(
  I: Pt, Cx0: Pt, Cx1: Pt, Cy: Pt[], keyId: string, A: Pt, numAttrPoints: number,
): Map<string, Pt> {
  let m = new Map<string, Pt>();
  m.set("I", I);
  m.set("C_x0", Cx0);
  m.set("C_x1", Cx1);
  m.set("G_x0", kvacSystem.Gx0);
  m.set("G_x1", kvacSystem.Gx1);

  m.set("0", Point.ZERO);
  let gens = uidEncryptionGenerators();
  m.set(`G_a1_${keyId}`, gens.Ga1);
  m.set(`G_a2_${keyId}`, gens.Ga2);
  m.set("sum(A)", A); // single key → sum(A) = A

  for (let i = 0; i < numAttrPoints; i++) {
    m.set(`G_y${i}`, kvacSystem.Gy[i]);
  }
  m.set("C_y0", Cy[0]);
  return m;
}

export interface PresentationProof {
  Cx0: Pt; Cx1: Pt; CV: Pt; Cy: Pt[];
  pokshoProof: Uint8Array;
}

export class AuthCredentialPresentation {
  constructor(
    readonly proof: PresentationProof,
    readonly aciCiphertext: KvacCiphertext,
    readonly pniCiphertext: KvacCiphertext,
    readonly redemptionTime: number | bigint,
  ) {}

  /** Bincode wire layout sent to the group server (zkc.rs):
   * version(1) + commitments(C_x0,C_x1,C_V, Vec<C_y>) + Vec<u8> proof
   * + aci_ciphertext(64) + pni_ciphertext(64) + redemption_time(u64 LE). */
  serialize(): Uint8Array {
    let w = new Writer();
    w.u8(PRESENTATION_VERSION_4);
    w.point(this.proof.Cx0).point(this.proof.Cx1).point(this.proof.CV);
    w.pointVec(this.proof.Cy);
    w.byteVec(this.proof.pokshoProof);
    w.point(this.aciCiphertext.EA1).point(this.aciCiphertext.EA2);
    w.point(this.pniCiphertext.EA1).point(this.pniCiphertext.EA2);
    w.u64(this.redemptionTime);
    return w.finish();
  }

  static deserialize(bytes: Uint8Array): AuthCredentialPresentation {
    let r = new Reader(bytes);
    r.versionByte(PRESENTATION_VERSION_4);
    let Cx0 = r.point(), Cx1 = r.point(), CV = r.point();
    let Cy = r.pointVec();
    let pokshoProof = r.byteVec();
    let aci: KvacCiphertext = { EA1: r.point(), EA2: r.point() };
    let pni: KvacCiphertext = { EA1: r.point(), EA2: r.point() };
    let redemptionTime = r.u64();
    r.end();
    return new AuthCredentialPresentation({ Cx0, Cx1, CV, Cy, pokshoProof }, aci, pni, redemptionTime);
  }
}

/** CLIENT: build the presentation for the group server. */
export function presentAuthCredential(
  credential: AuthCredentialWithPni,
  pub: CredentialPublicKey,
  groupSecretParams: GroupSecretParams,
  randomness: Uint8Array,
): AuthCredentialPresentation {
  let keyPair = groupSecretParams.uidKeyPair;
  let keyId = UID_ENCRYPTION_DOMAIN_ID;

  // attr_points: [public(identity), aci.M1, aci.M2, pni.M1, pni.M2].
  let aciPts = uidStructPoints(credential.aci);
  let pniPts = uidStructPoints(credential.pni);
  let attrPoints: Pt[] = [Point.ZERO, aciPts.M1, aciPts.M2, pniPts.M1, pniPts.M2];
  let attrs: AttrRef[] = [
    { encrypted: true, first: 1, second: 2 },
    { encrypted: true, first: 3, second: 4 },
  ];

  let sho = new Sho("Signal_ZKCredential_Presentation_20230410");
  sho.absorbAndRatchet(randomness);
  let z = sho.getScalar();

  // Commitments: C_yn = z·G_yn + Mn (public point 0 → just z·G_y0).
  let Cy = attrPoints.map((Mn, i) => kvacSystem.Gy[i].multiply(z).add(Mn));
  let Cx0 = kvacSystem.Gx0.multiply(z).add(credential.credential.U);
  let CV = kvacSystem.GV.multiply(z).add(credential.credential.V);
  let Cx1 = kvacSystem.Gx1.multiply(z).add(credential.credential.U.multiply(credential.credential.t));

  let z0 = Fn.create(Fn.mul(Fn.create(-z), credential.credential.t));
  let I = pub.pointI(attrPoints.length);
  let Z = I.multiply(z);

  let scalars = new Map<string, bigint>();
  scalars.set("z", z);
  scalars.set("t", credential.credential.t);
  scalars.set("z0", z0);
  scalars.set(`a1_${keyId}`, keyPair.a1);
  scalars.set(`a2_${keyId}`, keyPair.a2);
  scalars.set(`z1_${keyId}`, Fn.create(Fn.mul(Fn.create(-z), keyPair.a1)));

  let points = nonAttributePointArgs(I, Cx0, Cx1, Cy, keyId, keyPair.A, attrPoints.length);
  points.set("Z", Z);

  for (let attr of attrs) {
    points.set(`C_y${attr.first}`, Cy[attr.first]);
    let EA1 = attrPoints[attr.first].multiply(keyPair.a1);
    let EA2 = EA1.multiply(keyPair.a2).add(attrPoints[attr.second]);
    points.set(`E_A${attr.first}`, EA1);
    points.set(`-E_A${attr.first}`, EA1.negate());
    points.set(`C_y${attr.second}-E_A${attr.second}`, Cy[attr.second].subtract(EA2));
  }

  let proofRandomness = sho.squeezeAndRatchet(32);
  let st = presentationStatement(attrs, keyId);
  let pokshoProof = st.prove(scalars, points, new Uint8Array(0), proofRandomness);

  return new AuthCredentialPresentation(
    { Cx0, Cx1, CV, Cy, pokshoProof },
    keyPair.encrypt(aciPts.M1, aciPts.M2),
    keyPair.encrypt(pniPts.M1, pniPts.M2),
    credential.redemptionTime,
  );
}

/** SERVER: verify a presentation using the issuing MAC private key and the
 * group's public uid-encryption key (presentation.rs verify). */
export function verifyAuthCredentialPresentation(
  presentation: AuthCredentialPresentation,
  key: CredentialKeyPair,
  groupPublicParams: GroupPublicParams,
  redemptionTime: number | bigint,
): boolean {
  let priv = key.privateKey;
  let keyId = UID_ENCRYPTION_DOMAIN_ID;
  let { Cx0, Cx1, CV, Cy } = presentation.proof;

  // The public-attribute point 0: SHO over label + redemption time.
  let publicSho = new Sho(CREDENTIAL_LABEL);
  publicSho.absorbAndRatchet(u64BE(redemptionTime));
  let M0 = publicSho.getPoint();

  let attrPoints: Pt[] = [
    M0,
    presentation.aciCiphertext.EA1, presentation.aciCiphertext.EA2,
    presentation.pniCiphertext.EA1, presentation.pniCiphertext.EA2,
  ];
  if (Cy.length != attrPoints.length) {
    return false;
  }
  let attrs: AttrRef[] = [
    { encrypted: true, first: 1, second: 2 },
    { encrypted: true, first: 3, second: 4 },
  ];

  // Z = C_V − W − x0·C_x0 − x1·C_x1 − Σ y_i·C_yi − y0·M0.
  let Z = CV.subtract(priv.W).subtract(Cx0.multiply(priv.x0)).subtract(Cx1.multiply(priv.x1));
  for (let i = 0; i < Cy.length; i++) {
    Z = Z.subtract(Cy[i].multiply(priv.y[i]));
  }
  Z = Z.subtract(M0.multiply(priv.y[0]));

  let I = key.publicKey.pointI(attrPoints.length);
  let points = nonAttributePointArgs(I, Cx0, Cx1, Cy, keyId, groupPublicParams.uidPublicKey, attrPoints.length);

  for (let attr of attrs) {
    points.set(`C_y${attr.first}`, Cy[attr.first]);
    points.set(`E_A${attr.first}`, attrPoints[attr.first]);
    points.set(`-E_A${attr.first}`, attrPoints[attr.first].negate());
    points.set(`C_y${attr.second}-E_A${attr.second}`, Cy[attr.second].subtract(attrPoints[attr.second]));
  }
  points.set("Z", Z);

  let st = presentationStatement(attrs, keyId);
  return st.verify(presentation.proof.pokshoProof, points, new Uint8Array(0));
}
