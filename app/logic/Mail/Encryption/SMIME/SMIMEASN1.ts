import { define } from "../../../../../lib/asn1/api";

/** Object identifiers */
const oids = {
  "1.2.840.113549.1.1.1": "rsaEncryption",
  "1.2.840.113549.1.1.7": "rsaESOAEP",
  "1.2.840.113549.1.1.8": "mgf1",
  "1.2.840.113549.1.1.9": "pSpecified",
  "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
  "1.2.840.113549.1.5.12": "pkcs5PBKDF2",
  "1.2.840.113549.1.5.13": "pkcs5PBES2",
  "1.2.840.113549.1.7.1": "data",
  "1.2.840.113549.1.7.2": "signedData",
  "1.2.840.113549.1.7.3": "envelopedData",
  "1.2.840.113549.1.9.1": "E", // emailAddress
  "1.2.840.113549.1.9.3": "contentType",
  "1.2.840.113549.1.9.4": "messageDigest",
  "1.2.840.113549.1.9.5": "signingTime",
  "1.2.840.113549.2.7": "hmacWithSHA1",
  "1.2.840.113549.2.9": "hmacWithSHA256",
  "1.2.840.113549.2.10": "hmacWithSHA384",
  "1.2.840.113549.2.11": "hmacWithSHA512",
  "1.3.6.1.5.5.7.3.4": "emailProtection",
  //"1.3.6.1.5.5.8.1.2": "hmacWithSHA1",
  "1.3.14.3.2.26": "sha1",
  "2.1.0.1.1": "printstr",
  "2.5.4.3": "CN", // commonName
  "2.5.4.6": "C", // country
  "2.5.4.7": "L", // locality (city)
  "2.5.4.8": "ST", // state
  "2.5.4.10": "O", // organisation
  "2.5.4.11": "OU", // organsational unit
  "2.5.29.14": "subjectKeyIdentifier",
  "2.5.29.15": "keyUsage",
  "2.5.29.17": "subjectAlternativeName",
  "2.5.29.19": "basicConstraints",
  "2.5.29.35": "authorityKeyIdentifier",
  "2.5.29.37": "extKeyUsage",
  "2.16.840.1.101.3.4.1.2": "aes128cbc",
  "2.16.840.1.101.3.4.1.22": "aes192cbc",
  "2.16.840.1.101.3.4.1.42": "aes256cbc",
  "2.16.840.1.101.3.4.2.1": "sha256",
  "2.16.840.1.101.3.4.2.2": "sha384",
  "2.16.840.1.101.3.4.2.3": "sha512",
};

export const Null = define<void>("Null", function() {
  this.null();
});

export const OctetString = define<Uint8Array>("OctetString", function() {
  this.octstr();
});

export const Oid = define<string>("Oid", function() {
  this.objid(oids);
});

export const GeneralTime = define<number>("GeneralTime", function() {
  this.gentime();
});

/** An algorithm */
export const AlgorithmIdentifier = define("AlgorithmIdentifier", function() {
  this.seq().obj(
    this.key("algorithm").objid(oids),
    this.key("parameters").optional().any(),
  );
});

/**
 * A pair of an attribute and a value.
 * The attribute is always an OID.
 * The value is one of the string types.
 * The spec only mentions some of the string types,
 * but I've seen other ones in real certificates.
 */
const AttributeValue = define("AttributeValue", function() {
  this.set().obj(
    this.seq(
      this.key("type").objid(oids),
      this.key("value").choice({ utf8str: this.utf8str(), numstr: this.numstr(), printstr: this.printstr(), t61str: this.t61str(), ia5str: this.ia5str(), visstr: this.visstr(), unistr: this.unistr(), bmpstr: this.bmpstr() }),
    ),
  );
});

export const SubjectPublicKeyInfo = define("SubjectPublicKeyInfo", function() {
  this.seq().obj(
    this.key("algorithmIdentifier").use(AlgorithmIdentifier),
    /* When decoding, we could use .contains(RSAPublicKey) to
     * automatically extract the public key as an object, but
     * then the resulting object can't be re-encoded
     * (needed to generate the fingerprint) */
    this.key("subjectPublicKey").bitstr(),
  );
});

/** An RSA public key */
export interface RSAPublicKey {
  n: bigint; // modulus
  e: bigint; // public exponent
}
export const RSAPublicKey = define<RSAPublicKey>("RSAPublicKey", function() {
  this.seq().obj(
    this.key("n").int(),
    this.key("e").int(),
  );
});

/* A certificate extension */
const Extension = define("Extension", function() {
  this.seq().obj(
    this.key("extnID").objid(oids),
    this.key("critical").optional().bool(),
    this.key("extnValue").octstr(),
  );
});

const GeneralName = define("GeneralName", function() {
  this.choice({
    otherName: this.seq().obj(this.key("typeid").objid(oids), this.key("value").any().explicit(0)).implicit(0),
    rfc822Name: this.ia5str().implicit(1),
    DNSName: this.ia5str().implicit(2),
    uri: this.ia5str().implicit(6),
    ipAddress: this.octstr().implicit(7),
    id: this.objid(oids).implicit(8),
  });
});

export const SubjectAlternativeName = define("SubjectAlternativeName", function() {
  this.seqof(GeneralName);
});

/* An X.509 certificate */
export const Certificate = define("Certificate", function() {
  this.seq().obj(
    this.key("tbsCertificate").seq().obj(
      this.key("version").optional().explicit(0).int(),
      this.key("serialNumber").int(),
      this.key("signature").use(AlgorithmIdentifier),
      this.key("issuer").seqof(AttributeValue),
      this.key("validity").seq().obj(
        this.key("notBefore").choice({ utctime: this.utctime(), gentime: this.gentime() }),
        this.key("notAfter").choice({ utctime: this.utctime(), gentime: this.gentime() }),
      ),
      this.key("subject").seqof(AttributeValue),
      this.key("publicKey").use(SubjectPublicKeyInfo),
      this.key("issuerUniqueID").optional().implicit(1).bitstr(),
      this.key("subjectUniqueID").optional().implicit(2).bitstr(),
      this.key("extensions").optional().explicit(3).seqof(Extension),
    ),
    this.key("signatureAlgorithm").use(AlgorithmIdentifier),
    this.key("signatureValue").bitstr(),
  );
});

/* RSA Private key */
export interface RSAPrivateKey extends RSAPublicKey {
  d: bigint; // private exponent
  p: bigint; // prime 1
  q: bigint; // prime 2
  dP: bigint; // dP == d % (p - 1n)
  dQ: bigint; // dQ == d % (q - 1n)
  qInv: bigint; // 1 == qInv * q % p
  version: 0n;
}
export const RSAPrivateKey = define<RSAPrivateKey>("RSAPrivateKey", function() {
  this.seq().obj(
    this.key("version").int(),
    this.key("n").int(),
    this.key("e").int(),
    this.key("d").int(),
    this.key("p").int(),
    this.key("q").int(),
    this.key("dP").int(),
    this.key("dQ").int(),
    this.key("qInv").int(),
  );
});

export const PrivateKeyInfo = define("PrivateKeyInfo", function() {
  this.seq().obj(
    this.key("version").int(),
    this.key("privateKeyAlgorithm").use(AlgorithmIdentifier),
    this.key("privateKey").octstr(),
  );
});

export const EncryptedPrivateKeyInfo = define("EncryptedPrivateKeyInfo", function() {
  this.seq().obj(
    this.key("encryptionAlgorithm").use(AlgorithmIdentifier),
    this.key("encryptedData").octstr(),
  );
});

export const PBES2Params = define("PBES2Params", function() {
  this.seq().obj(
    this.key("keyDerivationFunc").use(AlgorithmIdentifier),
    this.key("encryptionScheme").use(AlgorithmIdentifier),
  );
});

export const PBKDF2Params = define("PBKDF2Params", function() {
  this.seq().obj(
    this.key("salt").choice({ "specified": this.octstr(), "other": this.use(AlgorithmIdentifier) }),
    this.key("iterationCount").int(),
    this.key("keyLength").optional().int(),
    this.key("prf").use(AlgorithmIdentifier).def("hmacWithSHA1"),
  );
});

/* CMS */
export const RSAESOAEPParams = define("RSAESOAEPParams", function() {
  this.seq().obj(
    this.key("hashFunc").explicit(0).use(AlgorithmIdentifier),
    this.key("maskGenFunc").explicit(1).use(AlgorithmIdentifier),
    this.key("pSourceFunc").explicit(2).use(AlgorithmIdentifier),
  );
});

const RecipientInfo = define("RecipientInfo", function() {
  this.choice({
    ktri: this.seq().obj(
      this.key("version").int(),
      this.key("rid").choice({
        issuerAndSerialNumber: this.seq().obj(
          this.key("issuer").seqof(AttributeValue),
          this.key("serialNumber").int(),
        ),
        subjectKeyIdentifier: this.explicit(0).octstr(), // TODO
      }),
      this.key("keyEncryptionAlgorithm").use(AlgorithmIdentifier),
      this.key("encryptedKey").octstr(),
    ),
    kari: this.explicit(1).any(), // Not supported
    kekri: this.explicit(2).any(), // Not supported
    pwri: this.explicit(3).any(), // Not supported
    ori: this.explicit(4).any(), // Not supported
  });
});

const Any = define("Any", function() {
  this.any();
});

const Attribute = define("Attribute", function() {
  this.seq().obj(
    this.key("attrType").objid(oids),
    this.key("attrValue").setof(Any),
  );
});

export const Attributes = define("Attributes", function() {
  this.setof(Attribute);
});

export const EnvelopedData = define("EnvelopedData", function() {
  this.seq().obj(
    this.key("contentType").objid(oids),
    this.key("content").explicit(0).seq().obj(
      this.key("version").int(),
      this.key("originatorInfo").implicit(0).optional().seq().obj( // Not supported
        this.key("certs").implicit(0).optional().setof(Any),
        this.key("crls").implicit(1).optional().setof(Any),
      ),
      this.key("recipientInfos").setof(RecipientInfo),
      this.key("encryptedContentInfo").seq().obj(
        this.key("contentType").objid(oids),
        this.key("contentEncryptionAlgorithm").use(AlgorithmIdentifier),
        // RFC5652 says this is implicit?
        this.key("encryptedContent").explicit(0).optional().octstr(),
      ),
      this.key("unprotectedAttrs").implicit(1).optional().use(Attributes),
    ),
  );
});

export const DigestInfo = define("DigestInfo", function() {
  this.seq().obj(
    this.key("digestAlgorithm").use(AlgorithmIdentifier),
    this.key("digest").octstr(),
  );
});

export const SignerInfo = define("SignerInfo", function() {
  this.seq().obj(
    this.key("version").int(),
    this.key("sid").choice({
      issuerAndSerialNumber: this.seq().obj(
        this.key("issuer").seqof(AttributeValue),
        this.key("serialNumber").int(),
      ),
      subjectKeyIdentifier: this.explicit(0).octstr(), // TODO
    }),
    this.key("digestAlgorithm").use(AlgorithmIdentifier),
    this.key("signedAttrs").implicit(0).optional().use(Attributes),
    this.key("signatureAlgorithm").use(AlgorithmIdentifier),
    this.key("signature").octstr(),
    this.key("unsignedAttrs").implicit(1).optional().use(Attributes),
  );
});

export const SignedData = define("SignedData", function() {
  this.seq().obj(
    this.key("contentType").objid(oids),
    this.key("content").explicit(0).seq().obj(
      this.key("version").int(),
      this.key("digestAlgorithms").setof(AlgorithmIdentifier),
      this.key("contentInfo").seq().obj(
        this.key("contentType").objid(oids),
        this.key("content").explicit(0).optional().any(),
      ),
      this.key("certificates").implicit(0).optional().setof(Certificate),
      this.key("crls").implicit(1).optional().setof(Any),
      this.key("signerInfos").setof(SignerInfo),
    ),
  );
});

/* Usage for the above definitions:
 * Decode a certificate in PEM format (string):
 * cert = Certificate.decodePEM(plaintext, { label: "CERTIFICATE" });
 * Decode a certificate in DER format (Uint8Array):
 * cert = Certificate.decode(uint8array);
 * Encode a certificate to DER format (Uint8Array):
 * uint8array = Certificate.encode(cert);
 * Encode a certificate to PEM format (string):
 * plaintext = Certificate.encodePEM(cert, { label: "CERTIFICATE" });
 * Decode the RSA public key from a certificate:
 * RSAPublicKey.decode(cert.tbsCertificate.publicKey.subjectPublicKey.data)
 */
