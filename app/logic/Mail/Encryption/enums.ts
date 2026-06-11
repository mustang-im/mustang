/**
 * Values: For storage in JSON, and
 * for display to the user in the UI.
 */
export enum EncryptionSystem {
  PGP = "OpenPGP",
  SMIME = "S/MIME",
  MLS = "MLS",
  Matrix = "Matrix",
  WhatsApp = "WhatsApp",
  Signal = "Signal",
  OMEMO = "XMPP/OMEMO",
}

export enum TrustLevel {
  /** User validated the certificate personally. Full trust. */
  Personal = "personal",
  /** A trusted third party has confirmed this certificate.
   * E.g. S/MIME CAs, my company, PGP key servers
   */
  ThirdParty = "third-party",
  /** A person that we talk with has sent us this certificate via
   * untrusted channels. */
  Sender = "sender",
  /** Revoked by owner, or disabled by our user */
  Distrusted = "distrust",
}

const kTrustOrder = [
  TrustLevel.Distrusted,
  TrustLevel.Sender,
  TrustLevel.ThirdParty,
  TrustLevel.Personal,
];

export function trustOrder(trustLevel: TrustLevel): number {
  return kTrustOrder.indexOf(trustLevel);
}

export const trustColor = {
  [TrustLevel.Personal]: "green",
  [TrustLevel.ThirdParty]: "blue",
  [TrustLevel.Sender]: "yellow",
  [TrustLevel.Distrusted]: "red",
}

export const trustColorFG = {
  [TrustLevel.Personal]: "white",
  [TrustLevel.ThirdParty]: "white",
  [TrustLevel.Sender]: "black",
  [TrustLevel.Distrusted]: "white",
}
