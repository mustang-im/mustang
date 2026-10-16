import type { EMail } from "../../../logic/Mail/EMail";
import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
import { TrustLevel } from "../../../logic/Mail/Encryption/enums";
import { gt } from "../../../l10n/l10n";

export class MessageSecurity {
  static isSigned(message: EMail, signingKey: PublicKey | null): boolean {
    return !!message.signedByKeyID && !!signingKey && signingKey.trustLevel != TrustLevel.Distrusted;
  }

  static title(isSigned: boolean, isEncrypted: boolean): string {
    // <copied from="../../../frontend/Mail/Message/EncryptionDetails.svelte">
    return isSigned && isEncrypted
      ? gt`End-to-end encrypted and signed`
      : isSigned
        ? gt`Signed`
        : gt`End-to-end-encrypted, but not signed`;
    // </copied>
  }

  static description(isSigned: boolean, isEncrypted: boolean, isMine: boolean, fromName: string): string {
    // <copied from="../../../frontend/Mail/Message/EncryptionDetails.svelte">
    return isMine
      ? gt`You sent this email`
      : isSigned && isEncrypted
        ? gt`If - and only if - you have confidence in the certificate below, you can be sure that this email was indeed written by ${fromName}. Only the recipients can read it, but the email provider cannot.`
        : isSigned
          ? gt`If - and only if - you have confidence in the certificate below, you can be sure that this email was indeed written by ${fromName}. It was not encrypted, meaning that it was not protected from surveillance.`
          : gt`Only the recipients can read this email, but there is no assurance about who wrote it.`;
    // </copied>
  }

  static trustLabel(level: TrustLevel, caName: string | null, personName: string): string {
    switch (level) {
      case TrustLevel.Personal:
        return gt`I have personally checked the verification code with ${personName}`;
      case TrustLevel.ThirdParty:
        return gt`${caName ?? ""} claims that this is correct`;
      case TrustLevel.Distrusted:
        return gt`This key is bad`;
      default:
        return gt`Not checked`;
    }
  }

  static trustChoices(signingKey: PublicKey): TrustLevel[] {
    // <copied from="../../../frontend/Contacts/PersonPage/EncryptionKey.svelte" acceptance>
    return [TrustLevel.Personal, signingKey.caName ? TrustLevel.ThirdParty : TrustLevel.Sender, TrustLevel.Distrusted];
    // </copied>
  }
}
