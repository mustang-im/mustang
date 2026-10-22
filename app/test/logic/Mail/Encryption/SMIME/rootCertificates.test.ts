import { SMIMEPublicKey, KeyStatus } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { TrustLevel } from "../../../../../logic/Mail/Encryption/enums";
import { appGlobal } from "../../../../../logic/app";
import { kISRGRootX1, kLetsEncryptR11, kSectigoEmailCAR36 } from "./rootCertificates";
import { afterEach, beforeEach, expect, test, describe, vi } from "vitest";

// The browser has this, but Node does not.
globalThis.indexedDB ??= {
  cmp(a: Uint8Array, b: Uint8Array): number {
    let length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      if (a[i] != b[i]) {
        return a[i] < b[i] ? -1 : 1;
      }
    }
    return Math.sign(a.length - b.length);
  },
} as any;

// Like Node's `tls.getCACertificates()`, whose "bundled" roots are for websites.
// `SMIMEPublicKey` caches the CA certificates per process, so this is the same for all tests in this file.
appGlobal.remoteApp = {
  async getCACertificates(type: string): Promise<string[]> {
    return type == "bundled" ? [kISRGRootX1] : [];
  },
};

// The real certificates expire
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-22T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("S/MIME root certificates", () => {
  test("a CA under a root that Mozilla trusts for email confirms the certificate", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kSectigoEmailCAR36);
    expect(await key.keyStatus()).toBe(KeyStatus.Valid);
    expect(key.trustLevel).toBe(TrustLevel.ThirdParty);
    expect(key.caName).toBe("Sectigo Public Email Protection Root R46");
  });

  test("a root that Mozilla trusts only for websites does not confirm the certificate", async () => {
    let key = await SMIMEPublicKey.importPublicKey(kLetsEncryptR11);
    expect(await key.keyStatus()).not.toBe(KeyStatus.Valid);
    expect(key.trustLevel).not.toBe(TrustLevel.ThirdParty);
  });
});
