import { expect, test, describe } from "vitest";
import { PrivateKeyInfo, RSAPrivateKey, RSAPublicKey, DigestInfo, Null, OctetString } from "./SMIMEASN1";
import { BlockType, padFF, padRandom, encrypt, decrypt, unpadPKCS } from "./SMIMERSAES";

/**
 * Builds an RSA private key the same way the app does: generate it with
 * WebCrypto, export as PKCS#8, and decode it through our own ASN.1 stack.
 * Uses 2048 bits (not the app's 4096) purely so the tests run quickly.
 */
async function generateRSAKey(): Promise<RSAPrivateKey> {
  let { privateKey } = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: Uint8Array.of(1, 0, 1), hash: "SHA-256" },
    true, ["sign"]);
  let privateKeyInfo = PrivateKeyInfo.decode(new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey)));
  return RSAPrivateKey.decode(privateKeyInfo.privateKey);
}

function digestInfoDER(): Uint8Array {
  return DigestInfo.encode({
    digestAlgorithm: { algorithm: "sha256", parameters: Null.encode() },
    digest: crypto.getRandomValues(new Uint8Array(32)),
  });
}

describe("ASN.1 DER round-trip", () => {
  test("RSA public key", async () => {
    let key = await generateRSAKey();
    let decoded = RSAPublicKey.decode(RSAPublicKey.encode({ n: key.n, e: key.e }));
    expect(decoded.n).toBe(key.n);
    expect(decoded.e).toBe(key.e);
  });

  test("DigestInfo", () => {
    let digest = crypto.getRandomValues(new Uint8Array(32));
    let decoded = DigestInfo.decode(DigestInfo.encode({
      digestAlgorithm: { algorithm: "sha256", parameters: Null.encode() },
      digest,
    }));
    expect(decoded.digestAlgorithm.algorithm).toBe("sha256");
    expect(Array.from(decoded.digest)).toEqual(Array.from(digest));
  });

  test("encodeBase64 handles large buffers without overflowing the stack", () => {
    let big = new Uint8Array(500_000); // spreading this into fromCharCode would throw
    for (let i = 0; i < big.length; i++) {
      big[i] = i & 0xff;
    }
    // Force the manual fallback, so we exercise it even where the native
    // Uint8Array.prototype.toBase64 exists.
    let native = Uint8Array.prototype.toBase64;
    delete (Uint8Array.prototype as any).toBase64;
    try {
      let decoded = OctetString.decodeBase64(OctetString.encodeBase64(big));
      expect(Array.from(decoded)).toEqual(Array.from(big));
    } finally {
      if (native) {
        Uint8Array.prototype.toBase64 = native;
      }
    }
  });
});

describe("RSA + PKCS#1 v1.5", () => {
  test("encrypt/decrypt round-trips a symmetric key (RSAES)", async () => {
    let key = await generateRSAKey();
    let symmetricKey = crypto.getRandomValues(new Uint8Array(32));
    let ciphertext = encrypt(padRandom(symmetricKey, key), key);
    let recovered = unpadPKCS(decrypt(ciphertext, key), BlockType.Encrypted);
    expect(Array.from(recovered)).toEqual(Array.from(symmetricKey));
  });

  test("sign/verify round-trips a DigestInfo (RSASSA)", async () => {
    let key = await generateRSAKey();
    let digestInfo = digestInfoDER();
    let signature = decrypt(padFF(digestInfo, key), key);
    let recovered = unpadPKCS(encrypt(signature, key), BlockType.Signed);
    expect(Array.from(recovered)).toEqual(Array.from(digestInfo));
  });

  test("unpadPKCS rejects signature padding that is not all 0xFF (BERserk hardening)", async () => {
    let key = await generateRSAKey();
    let block = padFF(digestInfoDER(), key);
    expect(() => unpadPKCS(block, BlockType.Signed)).not.toThrow();
    // Replace a padding octet with a non-0xFF, non-zero byte. The old, lenient
    // unpadding accepted this because it only required a run of non-zero bytes.
    let tampered = block.slice();
    tampered[5] = 0xab;
    expect(() => unpadPKCS(tampered, BlockType.Signed)).toThrow();
  });
});
