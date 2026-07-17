/** Device-provisioning messages (Provisioning.proto). The primary device encrypts
 * a ProvisionMessage to the linking device's public key (ProvisioningCipher) and
 * sends it over the provisioning WebSocket. See Docs/02-registration-and-provisioning. */
import { message, string, bytes, int, bool, type TypeOf } from "./codec";

export const ProvisioningAddress = message({
  address: string(1),
});
export type ProvisioningAddress = TypeOf<typeof ProvisioningAddress>;

export const ProvisionEnvelope = message({
  publicKey: bytes(1),        // the primary's ephemeral public key (33-byte DJB)
  body: bytes(2),             // encrypted ProvisionMessage (version ‖ iv ‖ ct ‖ mac)
});
export type ProvisionEnvelope = TypeOf<typeof ProvisionEnvelope>;

export const ProvisionMessage = message({
  aciIdentityKeyPublic: bytes(1),
  aciIdentityKeyPrivate: bytes(2),
  pniIdentityKeyPublic: bytes(11),
  pniIdentityKeyPrivate: bytes(12),
  aci: string(8),
  pni: string(10),
  number: string(3),
  provisioningCode: string(4),
  userAgent: string(5),
  profileKey: bytes(6),
  readReceipts: bool(7),
  provisioningVersion: int(9),
  ephemeralBackupKey: bytes(14),
  accountEntropyPool: string(15),
  mediaRootBackupKey: bytes(16),
  aciBinary: bytes(17),
  pniBinary: bytes(18),
});
export type ProvisionMessage = TypeOf<typeof ProvisionMessage>;

export enum ProvisioningVersion {
  Initial = 0,
  TabletSupport = 1,
  Current = 1,
}
