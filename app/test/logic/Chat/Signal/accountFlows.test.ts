// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { SignalAccount } from "../../../../logic/Chat/Signal/SignalAccount";
import { SignalApi } from "../../../../logic/Chat/Signal/Connection/SignalApi";
import { ServiceId } from "../../../../logic/Chat/Signal/ServiceId";
import { SignalStore } from "../../../../logic/Chat/Signal/Crypto/Store";
import { KeyPair } from "../../../../logic/Chat/Signal/Crypto/KeyPair";
import { KyberKeyPair } from "../../../../logic/Chat/Signal/Encryption/kyber";
import { xeddsaSign, djbDecode, xeddsaVerify } from "../../../../logic/Chat/Signal/Crypto/curve";
import { serializeKyberPublicKey } from "../../../../logic/Chat/Signal/Connection/keysJSON";
import {
  ServerSecretParams, issueAuthCredential, serializeIssuanceResponse,
} from "../../../../logic/Chat/Signal/Encryption/ZKGroup/credentials";
import { GroupSecretParams } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/groupParams";
import { presentAuthCredential, verifyAuthCredentialPresentation } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/presentation";
import { base64Encode, base64Decode, randomBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import type { ProvisionMessage } from "../../../../logic/Chat/Signal/Proto/provisioning";
import { expect, test } from "vitest";

void appGlobal;

class FakeApi extends SignalApi {
  calls: { method: string, path: string, body?: any, creds?: any }[] = [];
  responses = new Map<string, any>();
  constructor() { super("https://chat.signal.org"); }
  override async json<T = any>(method: string, path: string, body?: any, creds?: any): Promise<T> {
    this.calls.push({ method, path, body, creds });
    let r = this.responses.get(`${method} ${path.split("?")[0]}`);
    return (typeof r == "function" ? r(body) : r) as T;
  }
}

/** A SignalAccount whose `api()` returns a shared FakeApi, exposing the protected
 * link/upload/groupAuth methods for structural assertions. */
class TestAccount extends SignalAccount {
  fake = new FakeApi();
  testServerParams: any = null;
  override api(): SignalApi { return this.fake; }
  protected override serverPublicParams(): any {
    return this.testServerParams ?? super.serverPublicParams();
  }
  callFinishLink(message: ProvisionMessage) { return (this as any).finishLink(message); }
  callUploadPreKeys() { return (this as any).uploadPreKeys(); }
  callGroupAuth() { return (this as any).groupAuth(); }
}

function setupLinkedAccount(): TestAccount {
  let account = new TestAccount();
  account.aci = ServiceId.aci(randomBytes(16));
  account.pni = ServiceId.pni(randomBytes(16));
  account.profileKey = new Uint8Array(32).fill(5);
  let acc = account as any;
  account.aciStore = acc.buildIdentityStore(KeyPair.generate());
  account.kyberLastResort = acc.generateKyberLastResort(account.aciStore!.identityKeyPair);
  account.pniStore = acc.buildIdentityStore(KeyPair.generate());
  account.pniKyberLastResort = acc.generateKyberLastResort(account.pniStore!.identityKeyPair);
  account.servicePassword = base64Encode(randomBytes(18));
  return account;
}

test("finishLink PUTs /v1/devices/link with both ACI+PNI prekeys, sets device id/aci/pni", async () => {
  let account = setupLinkedAccount();
  account.name = "Mustang on Linux";
  let originalAci = account.aci!;
  let assignedAci = ServiceId.aci(randomBytes(16));
  let assignedPni = ServiceId.pni(randomBytes(16));
  account.fake.responses.set("PUT /v1/devices/link", {
    uuid: assignedAci.uuidString(), pni: assignedPni.uuidString(), deviceId: 4,
  });

  let message = { provisioningCode: "PROVCODE" } as ProvisionMessage;
  await account.callFinishLink(message);

  let call = account.fake.calls.find(c => c.path == "/v1/devices/link")!;
  expect(call.method).toBe("PUT");
  expect(call.body.verificationCode).toBe("PROVCODE");

  // Device attributes: both registration ids, encrypted device name, capabilities.
  let attrs = call.body.accountAttributes;
  expect(attrs.fetchesMessages).toBe(true);
  expect(attrs.registrationId).toBe(account.aciStore!.registrationID);
  expect(attrs.pniRegistrationId).toBe(account.pniStore!.registrationID);
  expect(typeof attrs.name).toBe("string"); // base64 encrypted device name
  expect(attrs.capabilities.spqr).toBe(true);

  // The four signed/last-resort prekeys are present and correctly sized.
  expect(base64Decode(call.body.aciSignedPreKey.publicKey).length).toBe(33);
  expect(base64Decode(call.body.pniSignedPreKey.publicKey).length).toBe(33);
  expect(base64Decode(call.body.aciPqLastResortPreKey.publicKey).length).toBe(1569);
  expect(base64Decode(call.body.pniPqLastResortPreKey.publicKey).length).toBe(1569);

  // PNI signed-prekey signature verifies against the PNI identity key.
  expect(xeddsaVerify(
    account.pniStore!.identityKeyPair.publicKey,
    base64Decode(call.body.pniSignedPreKey.publicKey),
    base64Decode(call.body.pniSignedPreKey.signature))).toBe(true);

  // Basic auth uses the (pre-response) ACI (Docs/02 §B.4) + our fresh password.
  expect(call.creds.username).toBe(originalAci.uuidString());
  expect(call.creds.password).toBe(account.servicePassword);

  // The response set our identifiers.
  expect(account.deviceID).toBe(4);
  expect(account.aci!.equals(assignedAci)).toBe(true);
  expect(account.pni!.equals(assignedPni)).toBe(true);
});

test("uploadPreKeys PUTs /v2/keys for both aci and pni with replenished one-time keys", async () => {
  let account = setupLinkedAccount();
  account.fake.responses.set("PUT /v2/keys", undefined);
  await account.callUploadPreKeys();

  let identities = account.fake.calls.filter(c => c.path.startsWith("/v2/keys")).map(c => c.path);
  expect(identities).toContain("/v2/keys?identity=aci");
  expect(identities).toContain("/v2/keys?identity=pni");

  let aciCall = account.fake.calls.find(c => c.path == "/v2/keys?identity=aci")!;
  expect(base64Decode(aciCall.body.identityKey).length).toBe(33);
  // A freshly built store publishes its full 100-key one-time set (server replaces).
  expect(aciCall.body.preKeys.length).toBe(100);
  expect(aciCall.body.preKeys.length).toBeLessThanOrEqual(100);
  expect(base64Decode(aciCall.body.pqLastResortPreKey.publicKey).length).toBe(1569);
  // Each one-time prekey is a 33-byte DJB EC key with no signature.
  expect(base64Decode(aciCall.body.preKeys[0].publicKey).length).toBe(33);
  expect(aciCall.body.preKeys[0].signature).toBeUndefined();
});

test("groupAuth fetches the 7-day window, verifies today's credential, pairs server params", async () => {
  let account = setupLinkedAccount();
  let aci = account.aci!, pni = account.pni!;

  // Issue real credentials for today + tomorrow under a test server key, and point
  // the account's serverPublicParams at that key so the full receive path runs.
  let server = ServerSecretParams.generate(randomBytes(32));
  account.testServerParams = server.getPublicParams();
  let today = Math.floor(Date.now() / 1000 / 86400) * 86400;
  let todayCred = serializeIssuanceResponse(issueAuthCredential(server.genericCredentialKeyPair, aci, pni, today, randomBytes(32)));
  let tomorrowCred = serializeIssuanceResponse(issueAuthCredential(server.genericCredentialKeyPair, aci, pni, today + 86400, randomBytes(32)));

  account.fake.responses.set("GET /v1/certificate/auth/group", {
    credentials: [
      // deliberately out of order to prove "pick today's", not "pick first"
      { credential: base64Encode(tomorrowCred), redemptionTime: today + 86400 },
      { credential: base64Encode(todayCred), redemptionTime: today },
    ],
    pni: pni.uuidString(),
  });

  let auth = await account.callGroupAuth();

  // The fetched credential was verified into an AuthCredentialWithPni for today,
  // and pairs with the server public params we injected.
  expect(Number(auth.credential.redemptionTime)).toBe(today);
  expect(auth.serverPublicParams).toBe(account.testServerParams);

  // The credential presents + verifies against a group (full zk round-trip).
  let group = GroupSecretParams.deriveFromMasterKey(randomBytes(32));
  let presentation = presentAuthCredential(
    auth.credential, auth.serverPublicParams.genericCredentialPublicKey, group, randomBytes(32));
  expect(verifyAuthCredentialPresentation(
    presentation, server.genericCredentialKeyPair, group.getPublicParams(), today)).toBe(true);

  // The request querystring carried a 7-day window.
  let call = account.fake.calls.find(c => c.path.startsWith("/v1/certificate/auth/group"))!;
  let qs = new URL("https://x" + call.path.slice(call.path.indexOf("?"))).searchParams;
  expect(Number(qs.get("redemptionEndSeconds")) - Number(qs.get("redemptionStartSeconds"))).toBe(7 * 86400);

  // A second call hits the cache (no new HTTP request).
  let before = account.fake.calls.length;
  await account.callGroupAuth();
  expect(account.fake.calls.length).toBe(before);
});

// Silence unused-import lints for symbols only used to set up fixtures.
void xeddsaSign; void djbDecode; void serializeKyberPublicKey; void KyberKeyPair;
