import { SignedData, OctetString, RDNSequence, Oid, UTCTime, Attributes, DigestInfo, Null, PrivateKeyInfo, RSAPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEASN1";
import { verifySignedData, sameName } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEVerify";
import { decrypt, padFF } from "../../../../../logic/Mail/Encryption/SMIME/SMIMERSAES";
import { appGlobal } from "../../../../../logic/app";
import { expect, test, describe } from "vitest";

// `verifySignedData()` compares digests using `indexedDB.cmp()`,
// which the browser has, but Node does not.
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

// The test CA is not a real CA, so no CA certificate vouches for it.
appGlobal.remoteApp ??= {
  async getCACertificates(type: string): Promise<string[]> {
    return [];
  },
};

/** The certificates of `kSignedByEva`, in the order that they are sent */
function certificates(): any[] {
  return SignedData.decodeFromBase64(kSignedByEva).content.certificates;
}

async function verify(signedData: any): Promise<any> {
  return await verifySignedData(signedData, OctetString.decode(signedData.content.contentInfo.content));
}

const kContent = "Content-Type: text/plain\r\n\r\nHello from Eva.\r\n";

/** The attributes of a correct message, for the tests to vary */
async function signedAttributes(): Promise<any[]> {
  let messageDigest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(kContent)));
  return [{
    attrType: "contentType",
    attrValue: [Oid.encode("data")],
  }, {
    attrType: "signingTime",
    attrValue: [UTCTime.encode(Date.parse("2026-09-03T06:29:01Z"))],
  }, {
    attrType: "messageDigest",
    attrValue: [OctetString.encode(messageDigest)],
  }];
}

/** Signs the attributes with Eva's key, and wraps them in an opaque-signed
 * message, the same way that `SMIMESend` builds it */
async function signAsEva(signedAttrs: any[], cert = certificates()[1]): Promise<any> {
  let attributesDigest = new Uint8Array(await crypto.subtle.digest("SHA-256", Attributes.encode(signedAttrs)));
  let digestInfo = {
    digestAlgorithm: { algorithm: "sha256", parameters: Null.encode() },
    digest: attributesDigest,
  };
  let key = RSAPrivateKey.decode(PrivateKeyInfo.decodePEM(kEvaKey, { label: "PRIVATE KEY" }).privateKey);
  return {
    contentType: "signedData",
    content: {
      version: 1n,
      digestAlgorithms: [{ algorithm: "sha256", parameters: Null.encode() }],
      contentInfo: {
        contentType: "data",
        content: OctetString.encode(new TextEncoder().encode(kContent)),
      },
      certificates: [cert],
      signerInfos: [{
        version: 1n,
        sid: {
          type: "issuerAndSerialNumber",
          value: {
            issuer: cert.tbsCertificate.issuer,
            serialNumber: cert.tbsCertificate.serialNumber,
          },
        },
        digestAlgorithm: { algorithm: "sha256", parameters: Null.encode() },
        signedAttrs,
        signatureAlgorithm: { algorithm: "rsaEncryption", parameters: Null.encode() },
        signature: decrypt(padFF(DigestInfo.encode(digestInfo), key), key),
      }],
    },
  };
}

describe("Which certificate signed", () => {
  test("compares attribute types that our OID map does not know", () => {
    let subject = certificates()[1].tbsCertificate.subject;
    // organizationIdentifier (2.5.4.97), as eIDAS certificates have it
    expect(subject.some(attr => Array.isArray(attr.type))).toBe(true);
    expect(sameName(subject, RDNSequence.decode(RDNSequence.encode(subject)))).toBe(true);

    let other = RDNSequence.decode(RDNSequence.encode(subject));
    other[1].value.value = "VATDE-666";
    expect(sameName(subject, other)).toBe(false);
  });

  test("finds the signer, even when the CA certificate is sent first", async () => {
    let signer = await verify(SignedData.decodeFromBase64(kSignedByEva));
    expect(signer?.userIDs.contents).toEqual(["eva@example.com"]);
  });

  test("does not accept a certificate that the signature does not name", async () => {
    let signedData = SignedData.decodeFromBase64(kSignedByEva);
    signedData.content.certificates = [certificates()[1]]; // only the signer
    signedData.content.signerInfos[0].sid.value.serialNumber = 4711n;
    expect(await verify(signedData)).toBe(null);
  });

  test("fails cleanly on a digest algorithm that we do not know", async () => {
    let signedData = SignedData.decodeFromBase64(kSignedByEva);
    signedData.content.signerInfos[0].digestAlgorithm.algorithm = "rsaESOAEP";
    expect(await verify(signedData)).toBe(null);
  });
});

describe("Signed attributes", () => {
  test("the message that the other tests vary verifies", async () => {
    let signer = await verify(await signAsEva(await signedAttributes()));
    expect(signer?.userIDs.contents).toEqual(["eva@example.com"]);
  });

  test("the content type must be signed, and must be the one of the message", async () => {
    let attributes = await signedAttributes();
    attributes[0].attrValue = [Oid.encode("encryptedData")];
    expect(await verify(await signAsEva(attributes))).toBe(null);
    expect(await verify(await signAsEva(attributes.slice(1)))).toBe(null);
  });
});

/* A CA and a signer certificate that both have an organizationIdentifier
 * (2.5.4.97) in their name, which our OID map does not know. The CA
 * certificate comes first in the message, so that the signer is only found
 * by matching the name.
 * openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out ca.key
 * openssl req -x509 -key ca.key -out ca.crt -days 3650 -sha256 \
 *   -subj "/CN=Test CA/2.5.4.97=VATDE-999" \
 *   -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign"
 * openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out eva.key
 * openssl req -new -key eva.key -out eva.csr \
 *   -subj "/CN=Eva/2.5.4.97=VATDE-123/emailAddress=eva@example.com"
 * openssl x509 -req -in eva.csr -out eva.crt -CA ca.crt -CAkey ca.key -days 3000 -sha256 \
 *   -set_serial 0x2a -extfile <(printf "basicConstraints=CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=emailProtection\nsubjectAltName=email:eva@example.com\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n")
 * printf 'Content-Type: text/plain\r\n\r\nHello from Eva.\r\n' > body.txt
 * openssl cms -sign -in body.txt -signer eva.crt -inkey eva.key -certfile ca.crt \
 *   -nodetach -binary -md sha256 -outform DER -out eva.p7m
 * openssl cms -verify -inform DER -in eva.p7m -CAfile ca.crt -purpose smimesign
 */
const kSignedByEva = `
  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
  F5M=
`;

/** Eva's private key, to sign the messages that the tests build */
const kEvaKey = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0eem+2K29+ouY
3GAnYhfhkfutx1bkJsQfDMklsYUJnwzPBRRPu/RAzg+7eygKYW8Oaiqof8ls/fXD
PSCRpKP51QOFKKoK85uflJDtC4e/NrePpW2pkjHo9In7+UpPqIgK8hasRCQvT7/v
scD9p//tiuj2FMLnQ7wBNy2Cq8LieBL9rXw7IlJksnLfIMVtd7rEb+7ECLcy2hYP
mytDCaRiifJ4RumTBpIMY9i+GzCn38tlJPMTj3Qi5S2yguDtprIMQI2MeA6v80KP
3uYs9ahuAoEzeZc0++37esMk19FQ07H5zAiYA8ZCRymC+b2pGXlfKjldG3m3mj55
H2dyGPi1AgMBAAECggEAGTvqjiqnBacgbvvGiKXTMlDtCxE8zvhfTPrGrSSIYMis
9nfUAooEeYMro/Ubq3KQH/MsNRRuSh+q2zo9cYpppabpBRdNyeuMg4rhm03qFGGc
LNOJOmpx3AvvtxwrYxPstvW+bHu3632PwqiXPrWHYo6c9WYAZ8GKv0jDGOrXJumS
yq9X7aicCvNuMrghMWkUceATurCHGNmMbOt2xIr4RVTS+g/xWQvwQ66Y7nwnWuHf
IkRtRoSH8y4tu2o+jBAuKTXHwJTxXqO9OnFBIBG2XwKu9wWdiTILeJPO0uBf26m2
rRTodhkUWAfBWTb+1yjCP+uS+d7Q9ZgHyvdfClVlyQKBgQDm+aXs+KewmBmlFXmt
r0dHmbSyuLTry4ByVTM/WVhG76zisHzqNIG343cXbLl9N5rsMH/AemJqMv+H97+h
2vvHU6Rg12jM9uEJ3l9LLaGRelNmjpphzRA930ltr6UIZMJSqci5v7gf1wI3z8w2
Zj0EC3QEY1YwuRWTGRnfulMtPwKBgQDIB57QeZNDNyCyWVXHVU30sgbv+iXfEgei
sNEy0WA/ztcX0f0L4EyH7DO3u6mdyTmMJzEVdg3/H8J1PdO/yAknI45iR/jyBRE4
KrI4trk/g/XvesgsLrwxvbW31ZYXWcynx1YD+1LAoW2LluVDEiZEUwvRxqtpF5jW
uYmxUM05CwKBgQChLdMY44f5VpqGtc68YhUmpN8Q3I38AX13y3bAnTNaBQSrCCeT
M+LVlNjVMtzZwYTNjyaHBaBJpZ7lngBPDUYnmXmazpbmeN0fCtuK1aPqpecvKRIY
b4YG9xsBfNF4Yv+rualF3cC6D0sP8WT7DStE+E0UhtFtnKquhJSmqBpE9wKBgAS4
wVP0erhsdbYgC7lP1y4+gZFqmzg/ybRabiW/8YCwFj22tD1yhvvyZGoi4Ocbl+Mq
DauPBNeP3Vw9IGF3jFfDLBo/zq2P1w83Wsuh7I+GQujrQgxg8gpOixqSzR8x/HW9
a9deOF7ZsKdJ4ZGKvSKBv1atVOB/MRloecqYuK9vAoGBAJhBElyFNcrH57rjAVbJ
4bMcRQFh3SQX3a/Ma/a0ooFRexZGVaysXvfFJ/lAQDAIOM/rRspcyS1enCmTVsXI
Qx5tVPeCThb0Y7Q0McOz9eZNfSZ/Jmq2EMUi2OR+SQjN0yNZMTTRhwun89YR9Ozw
d1kTfZ40oM8sTyaJlTdJANWn
-----END PRIVATE KEY-----
`;
