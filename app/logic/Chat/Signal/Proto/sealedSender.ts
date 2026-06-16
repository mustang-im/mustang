/** Sealed-sender protobuf messages (libsignal `sealed_sender.proto`).
 *
 * The certificate chain (ServerCertificate signs SenderCertificate) and the v1
 * UnidentifiedSenderMessage envelope. The inner UnidentifiedSenderMessageContent
 * (`UnidentifiedSenderMessage.Message`) wraps the already-encrypted ciphertext.
 *
 * proto2 `oneof`s are flattened: a oneof is just distinct field numbers, so we
 * declare each branch as its own optional field and read whichever is present. */
import { message, string, bytes, int, fixed64, type TypeOf } from "./codec";

/** ServerCertificate.Certificate — the server's signing pubkey + its id. */
export const ServerCertificateInner = message({
  id: int(1),
  key: bytes(2),               // server signing public key, 33-byte DJB
});
export type ServerCertificateInner = TypeOf<typeof ServerCertificateInner>;

export const ServerCertificate = message({
  certificate: bytes(1),       // serialized ServerCertificateInner
  signature: bytes(2),         // trust-root signature over `certificate`
});
export type ServerCertificate = TypeOf<typeof ServerCertificate>;

/** SenderCertificate.Certificate. `senderUuid` and `signer` are proto2 oneofs. */
export const SenderCertificateInner = message({
  senderE164: string(1),
  senderDevice: int(2),
  expires: fixed64(3),         // epoch ms
  identityKey: bytes(4),       // sender identity public key, 33-byte DJB
  signerCertificate: bytes(5), // oneof signer: embedded serialized ServerCertificate
  uuidString: string(6),       // oneof senderUuid
  uuidBytes: bytes(7),         // oneof senderUuid
  signerId: int(8),            // oneof signer: reference to a KNOWN_SERVER_CERTIFICATE id
});
export type SenderCertificateInner = TypeOf<typeof SenderCertificateInner>;

export const SenderCertificate = message({
  certificate: bytes(1),       // serialized SenderCertificateInner
  signature: bytes(2),         // ServerCertificate.key signature over `certificate`
});
export type SenderCertificate = TypeOf<typeof SenderCertificate>;

/** UnidentifiedSenderMessage.Message — the inner, signed payload (USMC). */
export const UnidentifiedSenderMessageContentProto = message({
  type: int(1),                // ProtoMessageType (see CiphertextType below)
  senderCertificate: bytes(2), // serialized SenderCertificate
  content: bytes(3),           // the already-encrypted CiphertextMessage, or PlaintextContent
  contentHint: int(4),         // ContentHint; absent ⇒ Default
  groupId: bytes(5),
});
export type UnidentifiedSenderMessageContentProto = TypeOf<typeof UnidentifiedSenderMessageContentProto>;

/** v1 outer envelope (single-recipient KEM). */
export const UnidentifiedSenderMessageV1 = message({
  ephemeralPublic: bytes(1),   // E.pub, 33-byte DJB
  encryptedStatic: bytes(2),   // AES-CTR(senderIdentityPublic) ‖ mac10
  encryptedMessage: bytes(3),  // AES-CTR(serialized USMC) ‖ mac10
});
export type UnidentifiedSenderMessageV1 = TypeOf<typeof UnidentifiedSenderMessageV1>;
