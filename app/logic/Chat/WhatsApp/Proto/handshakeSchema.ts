/** Schemas for the Noise handshake, the login/registration ClientPayload, and
 * the server certificate chain — same readable DSL as the message schema. */
import { message, string, bytes, int, bool, sub, encode, decode, type TypeOf } from "./codec";

/** UserAgent.platform values. */
export enum Platform {
  Android = 0,
  iOS = 1,
  SMBAndroid = 10,
  Web = 14,
}

/** ClientPayload.product values. */
export enum Product {
  WhatsApp = 0,
  Messenger = 1,
  Interop = 2,
}

// --- Noise handshake ---

export const ClientHello = message({
  ephemeral: bytes(1),
  static: bytes(2),
  payload: bytes(3),
});

export const ServerHello = message({
  ephemeral: bytes(1),
  static: bytes(2),
  payload: bytes(3),
});
export type ServerHello = TypeOf<typeof ServerHello>;

export const ClientFinish = message({
  static: bytes(1),
  payload: bytes(2),
});

export const HandshakeMessage = message({
  clientHello: sub(2, () => ClientHello),
  serverHello: sub(3, () => ServerHello),
  clientFinish: sub(4, () => ClientFinish),
});
export type HandshakeMessage = TypeOf<typeof HandshakeMessage>;

// --- ClientPayload (login / companion registration) ---

export const AppVersion = message({
  primary: int(1),
  secondary: int(2),
  tertiary: int(3),
});

export const UserAgent = message({
  platform: int(1),
  appVersion: sub(2, () => AppVersion),
  mcc: string(3),
  mnc: string(4),
  osVersion: string(5),
  manufacturer: string(6),
  device: string(7),
  osBuildNumber: string(8),
  phoneID: string(9),
  releaseChannel: int(10),
  localeLanguageIso6391: string(11),
  localeCountryIso31661Alpha2: string(12),
});

export const DevicePairingRegistrationData = message({
  eRegid: bytes(1),
  eKeytype: bytes(2),
  eIdent: bytes(3),
  eSkeyID: bytes(4),
  eSkeyVal: bytes(5),
  eSkeySig: bytes(6),
  buildHash: bytes(7),
  deviceProps: bytes(8),
});

export const ClientPayload = message({
  username: int(1),
  passive: bool(3),
  userAgent: sub(5, () => UserAgent),
  connectType: int(12),
  connectReason: int(13),
  device: int(18),
  devicePairingData: sub(19, () => DevicePairingRegistrationData),
  product: int(20),
  pull: bool(33),
});
export type ClientPayload = TypeOf<typeof ClientPayload>;

// --- server certificate chain ---

export const NoiseCertificate = message({
  details: bytes(1),
  signature: bytes(2),
});

export const CertChain = message({
  leaf: sub(1, () => NoiseCertificate),
  intermediate: sub(2, () => NoiseCertificate),
});
export type CertChain = TypeOf<typeof CertChain>;

export function encodeHandshakeMessage(value: HandshakeMessage): Uint8Array {
  return encode(HandshakeMessage, value);
}
export function decodeHandshakeMessage(data: Uint8Array): HandshakeMessage {
  return decode(HandshakeMessage, data);
}
export function encodeClientPayload(value: ClientPayload): Uint8Array {
  return encode(ClientPayload, value);
}
export function decodeCertChain(data: Uint8Array): CertChain {
  return decode(CertChain, data);
}

/** WhatsApp's pinned Noise root certificate public key (Curve25519). */
export const kWaCertPublicKey = Uint8Array.from([
  0x14, 0x23, 0x75, 0x57, 0x4d, 0x0a, 0x58, 0x71, 0x66, 0xaa, 0xe7, 0x1e, 0xbe, 0x51, 0x64, 0x37,
  0xc4, 0xa2, 0x8b, 0x73, 0xe3, 0x69, 0x5c, 0x6c, 0xe1, 0xf7, 0xf9, 0x54, 0x5d, 0xa8, 0xee, 0x6b,
]);
