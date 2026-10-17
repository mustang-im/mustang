import type { EMail } from "../../../logic/Mail/EMail";
import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
import type { PrivateKey } from "../../../logic/Mail/Encryption/PrivateKey";
import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
import { getMyPrivateKey } from "../../../logic/Mail/Encryption/KeyUtils";
import { SettingsDialogs } from "../../Settings/SettingsDialogs";
import { showError } from "../../../frontend/Util/error";
import { assert, UserError } from "../../../logic/util/util";
import { gt } from "../../../l10n/l10n";

type MyKey = PublicKey & PrivateKey;

export class ComposerEncryption {
  static privateKey(identity: MailIdentity): MyKey | null {
    return identity ? getMyPrivateKey(identity) ?? null : null;
  }

  static signDisabledReason(privateKey: MyKey | null): string | null {
    return privateKey ? null : gt`No secret keys enabled for signing`;
  }

  static encryptDisabledReason(mail: EMail): string | null {
    return mail.mustEncrypt
      ? gt`Policy requires that this email stays encrypted, to keep protect secret information`
      : null;
  }

  static applyIdentityDefaults(mail: EMail, privateKey: MyKey | null) {
    // <copied from="../../../frontend/Mail/Composer/EncryptionButtons.svelte" changedIdentity()>
    let extra = mail as any;
    if (privateKey) {
      if (!mail.signedByKeyID && privateKey.useToSign) {
        mail.signedByKeyID = privateKey.id;
        extra.signOnlyByDefault = true;
      }
      if (!mail.shouldEncrypt && privateKey.encryptByDefault) {
        mail.shouldEncrypt = true;
        extra.encryptOnlyByDefault = true;
      }
      if (mail.signedByKeyID && extra.signOnlyByDefault && !privateKey.useToSign) {
        mail.signedByKeyID = null;
        extra.signOnlyByDefault = false;
      }
      if (mail.shouldEncrypt && extra.encryptOnlyByDefault && !privateKey.encryptByDefault) {
        mail.shouldEncrypt = null;
        extra.encryptOnlyByDefault = false;
      }
    } else {
      assert(!mail.mustEncrypt, gt`This email must be encrypted.`);
      mail.shouldEncrypt = false;
      mail.signedByKeyID = null;
    }
    // </copied>
  }

  static toggleSigned(mail: EMail, identity: MailIdentity) {
    // <copied from="../../../frontend/Mail/Composer/EncryptionButtons.svelte" toggleSigned()>
    if (mail.mustEncrypt) {
      return;
    }
    if (mail.signedByKeyID && mail.shouldEncrypt) {
      mail.shouldEncrypt = false;
    } else if (mail.signedByKeyID) {
      mail.signedByKeyID = null;
      mail.shouldEncrypt = false;
    } else {
      ComposerEncryption.sign(mail, identity);
    }
    // </copied>
  }

  static toggleEncrypted(mail: EMail, identity: MailIdentity) {
    // <copied from="../../../frontend/Mail/Composer/EncryptionButtons.svelte" toggleEncrypted()>
    if (mail.mustEncrypt) {
      return;
    }
    let encryptDisabledReason = ComposerEncryption.encryptDisabledReason(mail);
    if (!mail.shouldEncrypt && encryptDisabledReason) {
      showError(new UserError(encryptDisabledReason));
      return;
    }

    mail.shouldEncrypt = !mail.shouldEncrypt;
    if (mail.shouldEncrypt && !mail.signedByKeyID) {
      ComposerEncryption.sign(mail, identity);
    }
    // </copied>
  }

  static sign(mail: EMail, identity: MailIdentity) {
    // <copied from="../../../frontend/Mail/Composer/EncryptionButtons.svelte" doSign()>
    if (ComposerEncryption.signDisabledReason(ComposerEncryption.privateKey(identity))) {
      ComposerEncryption.openTrustCenter(identity);
      return;
    }
    mail.signedByKeyID = getMyPrivateKey(identity)?.id;
    assert(mail.signedByKeyID, "No signing key found");
    // </copied>
  }

  static openTrustCenter(identity: MailIdentity) {
    SettingsDialogs.openTrustCenter(identity);
  }
}
