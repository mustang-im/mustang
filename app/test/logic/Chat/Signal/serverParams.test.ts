import { signalServerPublicParams } from "../../../../logic/Chat/Signal/Connection/serverParams";
import { ServerPublicParams, ServerSecretParams } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/credentials";
import {
  issueAuthCredential, serializeIssuanceResponse, receiveAuthCredentialWithPniZkc,
} from "../../../../logic/Chat/Signal/Encryption/ZKGroup/credentials";
import {
  presentAuthCredential, verifyAuthCredentialPresentation,
} from "../../../../logic/Chat/Signal/Encryption/ZKGroup/presentation";
import { GroupSecretParams, ServiceId } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/groupParams";
import { expect, test } from "vitest";

let SECONDS_PER_DAY = 86400;
function arr(len: number, base: number): Uint8Array {
  return Uint8Array.from({ length: len }, (_, i) => (base + i) & 0xFF);
}

test("production server public params parse to a usable generic credential key", () => {
  let params = signalServerPublicParams();
  // The generic credential public key has C_W + 6 I-points (I_2..I_7).
  expect(params.genericCredentialPublicKey.I.length).toBe(6);
  // pointI(5) (the auth credential's 5 attribute points) must be defined.
  expect(params.genericCredentialPublicKey.pointI(5)).toBeDefined();
});

test("a self-issued credential round-trips through the parsed-blob public key", () => {
  // Generate a matching server key pair, serialize its full ServerPublicParams the
  // way the production blob is laid out, parse it back, and verify it equals the
  // in-memory generic key (proves the deserialize offset/layout is correct).
  let secret = ServerSecretParams.generate(arr(32, 7));
  let publicInMemory = secret.getPublicParams();

  let serialized = serializeServerPublicParams(publicInMemory);
  let parsed = ServerPublicParams.deserialize(serialized);

  expect(parsed.genericCredentialPublicKey.CW.equals(publicInMemory.genericCredentialPublicKey.CW)).toBe(true);
  for (let i = 0; i < 6; i++) {
    expect(parsed.genericCredentialPublicKey.I[i].equals(publicInMemory.genericCredentialPublicKey.I[i])).toBe(true);
  }

  // And the parsed key still verifies a real issuance + presentation end to end.
  let aci = ServiceId.aci(arr(16, 0));
  let pni = ServiceId.pni(arr(16, 100));
  let group = GroupSecretParams.deriveFromMasterKey(arr(32, 100));
  let redemptionTime = 123456 * SECONDS_PER_DAY;

  let issuance = issueAuthCredential(secret.genericCredentialKeyPair, aci, pni, redemptionTime, arr(32, 200));
  let credential = receiveAuthCredentialWithPniZkc(
    serializeIssuanceResponse(issuance), parsed.genericCredentialPublicKey, aci, pni, redemptionTime);
  let presentation = presentAuthCredential(
    credential, parsed.genericCredentialPublicKey, group, arr(32, 3));
  expect(verifyAuthCredentialPresentation(
    presentation, secret.genericCredentialKeyPair, group.getPublicParams(), redemptionTime)).toBe(true);
});

test("ServerPublicParams.deserialize rejects a wrong-length blob", () => {
  expect(() => ServerPublicParams.deserialize(new Uint8Array(100))).toThrow();
});

/** Serialize a ServerPublicParams into the 673-byte production layout (reserved(1)
 * + 7 legacy/sig keys as zero-filled placeholders + generic(224) + endorsement(32)).
 * Only the generic key matters for parsing, so the placeholders are zeroed. */
function serializeServerPublicParams(params: ServerPublicParams): Uint8Array {
  let out = new Uint8Array(673);
  let off = 417; // generic_credential_public_key offset
  out.set(params.genericCredentialPublicKey.CW.toBytes(), off);
  for (let i = 0; i < 6; i++) {
    out.set(params.genericCredentialPublicKey.I[i].toBytes(), off + 32 + i * 32);
  }
  return out;
}
