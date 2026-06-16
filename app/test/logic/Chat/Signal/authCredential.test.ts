import {
  ServerSecretParams, issueAuthCredential, serializeIssuanceResponse,
  receiveAuthCredentialWithPniZkc,
} from "../../../../logic/Chat/Signal/Encryption/ZKGroup/credentials";
import {
  presentAuthCredential, verifyAuthCredentialPresentation, AuthCredentialPresentation,
} from "../../../../logic/Chat/Signal/Encryption/ZKGroup/presentation";
import { GroupSecretParams, ServiceId } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/groupParams";
import { bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

let SECONDS_PER_DAY = 86400;
function arr(len: number, base: number): Uint8Array {
  return Uint8Array.from({ length: len }, (_, i) => (base + i) & 0xFF);
}
let TEST_ARRAY_16 = arr(16, 0);
let TEST_ARRAY_16_1 = arr(16, 100);
let TEST_ARRAY_32 = arr(32, 0);
let TEST_ARRAY_32_1 = arr(32, 100);
let TEST_ARRAY_32_2 = arr(32, 200);
let TEST_ARRAY_32_5 = arr(32, 3);

// libsignal integration_tests.rs AUTH_CREDENTIAL_PRESENTATION_V4_RESULT — the
// end-to-end fixed-randomness gold vector.
let AUTH_V4 =
  "035e3e79afda8dc0d489fcf7c78f71e1502f2e06e8aeb20149046f85b3004d3f7f982d57dfad49cd1e6c335755cef4cc5e8d3de1eb4f5e8f24d71cf9f2220ae750f47181d71aaabbd48a1916813ec08eea935eb013395bf72f9139da8ef4f9530d05000000000000007a080544e6ee8ee2ff0dc298f18841103a9f9ec38631df8682e241755f86f74e26301872f4f32a9bb80f5b17651c0c83253a8013532384061a1febf79e58e60fa215b31da678305fa2a271655e35824630d0804680ec0bf29b1c775652683c3a5cec537c3514df730f267371d909f29cc6252af30afe3ea846c0cf56478bdc5b7a7f983ea7c24ecef4b371286a6414b2c38a57a7f59a9df33e430736c1a2ca14e00000000000000015416082ff7e3a741a4c3c31be3c95d4a31f2cf742685e0b17cd7f7205230e0e4e67b4b6ed45e705de13a1cb7170897bb32c9db6f9a1108fddfc7fae9eb2ca0c5fc3d8ccbd79d992eeed333626a1f0c37f0b25625955611e5ba33c782c50550045923582280cd93c3e9555b4e36eec20993f60b6aeb9ddb7f2856c4659546f037b33534a0292c77a501a70796f24ff37c8311bdfea8bb6c78f909563fe6e3b0386f36adc92090694ebb106a837bac046ad26e2472ee16408e9fd84269fd78c00c5dde91fcf202a6afad3441b9e2a34f4831d5bf560c81b38d951cb7c88e4d701765de9df4cfa5487f360e29e99343e91811baec331c4680985e608ca5d408e21725c6aa1b61d5a8b48d75f4aaa9a3cbe88d3e0f1a54319081f77c72c8f525474de749a0fef17b06bbce74ca5d0f7a0c45f443a1901f1e3e016d3548e50a2fa19ce6b27ac467ed9c9f5018b2a4456b6c2b1a91454422fdd473c9636a8459e1c170060c77b02000000";

test("AuthCredentialWithPni issuance + presentation reproduce the v4 KAT", () => {
  let serverSecret = ServerSecretParams.generate(TEST_ARRAY_32);
  let serverPublic = serverSecret.getPublicParams();

  let groupSecret = GroupSecretParams.deriveFromMasterKey(TEST_ARRAY_32_1);
  let groupPublic = groupSecret.getPublicParams();

  let aci = ServiceId.aci(TEST_ARRAY_16);
  let pni = ServiceId.pni(TEST_ARRAY_16_1);
  let redemptionTime = 123456 * SECONDS_PER_DAY;

  // SERVER issues.
  let issuance = issueAuthCredential(
    serverSecret.genericCredentialKeyPair, aci, pni, redemptionTime, TEST_ARRAY_32_2);
  let responseBytes = serializeIssuanceResponse(issuance);

  // CLIENT receives + verifies.
  let credential = receiveAuthCredentialWithPniZkc(
    responseBytes, serverPublic.genericCredentialPublicKey, aci, pni, redemptionTime);

  // CLIENT presents.
  let presentation = presentAuthCredential(
    credential, serverPublic.genericCredentialPublicKey, groupSecret, TEST_ARRAY_32_5);

  expect(bytesToHex(presentation.serialize())).toBe(AUTH_V4);

  // SERVER verifies the presentation.
  expect(verifyAuthCredentialPresentation(
    presentation, serverSecret.genericCredentialKeyPair, groupPublic, redemptionTime)).toBe(true);

  // Round-trip the wire bytes.
  let reparsed = AuthCredentialPresentation.deserialize(presentation.serialize());
  expect(verifyAuthCredentialPresentation(
    reparsed, serverSecret.genericCredentialKeyPair, groupPublic, redemptionTime)).toBe(true);

  // The PNI ciphertext equals the group's own encryption (no new info leaked).
  let pniCt = groupSecret.encryptServiceId(pni);
  expect(presentation.pniCiphertext.EA1.equals(pniCt.EA1)).toBe(true);
  expect(presentation.pniCiphertext.EA2.equals(pniCt.EA2)).toBe(true);
});
