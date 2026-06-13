/** Serialization of the Signal wire messages (version 3, as WhatsApp uses).
 * Each is `versionByte || protobuf [|| trailer]`. */
import { ProtoWriter, readProto, getBytes, getInt } from "../Proto/ProtobufLite";
import { hmacSHA256, concatBytes, bytesEqual } from "./primitives";
import { xeddsaSign, xeddsaVerify } from "./curve";

export const kSignalVersion = 0x33; // (3 << 4) | 3
const kMacLength = 8;

export interface SignalMessageFields {
  ratchetKey: Uint8Array; // 33-byte djb-encoded
  counter: number;
  previousCounter: number;
  ciphertext: Uint8Array;
}

/** SignalMessage = version || protobuf || 8-byte MAC. The MAC covers
 * senderIdentity || receiverIdentity || version || protobuf (33-byte identities). */
export function serializeSignalMessage(fields: SignalMessageFields, macKey: Uint8Array,
    senderIdentity: Uint8Array, receiverIdentity: Uint8Array): Uint8Array {
  let proto = new ProtoWriter()
    .bytes(1, fields.ratchetKey)
    .varint(2, fields.counter)
    .varint(3, fields.previousCounter)
    .bytes(4, fields.ciphertext)
    .finish();
  let versioned = concatBytes(new Uint8Array([kSignalVersion]), proto);
  let mac = hmacSHA256(macKey, concatBytes(senderIdentity, receiverIdentity, versioned)).subarray(0, kMacLength);
  return concatBytes(versioned, mac);
}

export interface ParsedSignalMessage extends SignalMessageFields {
  /** version || protobuf, the bytes the MAC is computed over */
  versionedBody: Uint8Array;
  mac: Uint8Array;
}

export function parseSignalMessage(data: Uint8Array): ParsedSignalMessage {
  let versionedBody = data.subarray(0, data.length - kMacLength);
  let mac = data.subarray(data.length - kMacLength);
  let fields = readProto(data.subarray(1, data.length - kMacLength));
  return {
    ratchetKey: getBytes(fields, 1)!,
    counter: getInt(fields, 2) ?? 0,
    previousCounter: getInt(fields, 3) ?? 0,
    ciphertext: getBytes(fields, 4)!,
    versionedBody: versionedBody.slice(),
    mac: mac.slice(),
  };
}

export function verifySignalMessageMAC(parsed: ParsedSignalMessage, macKey: Uint8Array,
    senderIdentity: Uint8Array, receiverIdentity: Uint8Array): boolean {
  let expected = hmacSHA256(macKey, concatBytes(senderIdentity, receiverIdentity, parsed.versionedBody)).subarray(0, kMacLength);
  return bytesEqual(expected, parsed.mac);
}

export interface PreKeySignalMessageFields {
  registrationID: number;
  preKeyID?: number;
  signedPreKeyID: number;
  baseKey: Uint8Array; // 33-byte djb-encoded
  identityKey: Uint8Array; // 33-byte djb-encoded
  message: Uint8Array; // a serialized SignalMessage
}

export function serializePreKeySignalMessage(fields: PreKeySignalMessageFields): Uint8Array {
  let proto = new ProtoWriter()
    .varint(5, fields.registrationID)
    .varint(1, fields.preKeyID)
    .varint(6, fields.signedPreKeyID)
    .bytes(2, fields.baseKey)
    .bytes(3, fields.identityKey)
    .bytes(4, fields.message)
    .finish();
  return concatBytes(new Uint8Array([kSignalVersion]), proto);
}

export function parsePreKeySignalMessage(data: Uint8Array): PreKeySignalMessageFields {
  let fields = readProto(data.subarray(1));
  return {
    registrationID: getInt(fields, 5) ?? 0,
    preKeyID: getInt(fields, 1),
    signedPreKeyID: getInt(fields, 6) ?? 0,
    baseKey: getBytes(fields, 2)!,
    identityKey: getBytes(fields, 3)!,
    message: getBytes(fields, 4)!,
  };
}

export interface SenderKeyMessageFields {
  keyID: number;
  iteration: number;
  ciphertext: Uint8Array;
}

/** SenderKeyMessage = version || protobuf || 64-byte signature (over version||protobuf). */
export function serializeSenderKeyMessage(fields: SenderKeyMessageFields, signingPrivateKey: Uint8Array): Uint8Array {
  let proto = new ProtoWriter()
    .varint(1, fields.keyID)
    .varint(2, fields.iteration)
    .bytes(3, fields.ciphertext)
    .finish();
  let versioned = concatBytes(new Uint8Array([kSignalVersion]), proto);
  let signature = xeddsaSign(signingPrivateKey, versioned);
  return concatBytes(versioned, signature);
}

export function parseSenderKeyMessage(data: Uint8Array, signingPublicKey: Uint8Array): SenderKeyMessageFields {
  let versioned = data.subarray(0, data.length - 64);
  let signature = data.subarray(data.length - 64);
  if (!xeddsaVerify(signingPublicKey, versioned, signature)) {
    throw new Error("SenderKeyMessage signature verification failed");
  }
  let fields = readProto(data.subarray(1, data.length - 64));
  return {
    keyID: getInt(fields, 1) ?? 0,
    iteration: getInt(fields, 2) ?? 0,
    ciphertext: getBytes(fields, 3)!,
  };
}

export interface SenderKeyDistributionFields {
  id: number;
  iteration: number;
  chainKey: Uint8Array;
  signingKey: Uint8Array; // 32-byte XEdDSA public key
}

export function serializeSenderKeyDistributionMessage(fields: SenderKeyDistributionFields): Uint8Array {
  let proto = new ProtoWriter()
    .varint(1, fields.id)
    .varint(2, fields.iteration)
    .bytes(3, fields.chainKey)
    .bytes(4, fields.signingKey)
    .finish();
  return concatBytes(new Uint8Array([kSignalVersion]), proto);
}

export function parseSenderKeyDistributionMessage(data: Uint8Array): SenderKeyDistributionFields {
  let fields = readProto(data.subarray(1));
  return {
    id: getInt(fields, 1) ?? 0,
    iteration: getInt(fields, 2) ?? 0,
    chainKey: getBytes(fields, 3)!,
    signingKey: getBytes(fields, 4)!,
  };
}
