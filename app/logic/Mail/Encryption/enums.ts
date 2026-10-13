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
  /** The user's local operating system has confirmed this certificate. */
  OS = "operating-system",
  /** A person that we talk with has sent us this certificate via
   * untrusted channels. */
  Sender = "sender",
  /** Revoked by owner, or disabled by our user */
  Distrusted = "distrust",
}

const kTrustOrder = [
  TrustLevel.Distrusted,
  TrustLevel.Sender,
  TrustLevel.OS,
  TrustLevel.ThirdParty,
  TrustLevel.Personal,
];

export function trustOrder(trustLevel: TrustLevel): number {
  return kTrustOrder.indexOf(trustLevel);
}

export const trustColor = {
  [TrustLevel.Personal]: "green",
  [TrustLevel.ThirdParty]: "blue",
  [TrustLevel.OS]: "#005eff", // lighter blue
  [TrustLevel.Sender]: "yellow",
  [TrustLevel.Distrusted]: "red",
}

export const trustColorFG = {
  [TrustLevel.Personal]: "white",
  [TrustLevel.ThirdParty]: "white",
  [TrustLevel.OS]: "white",
  [TrustLevel.Sender]: "black",
  [TrustLevel.Distrusted]: "white",
}
