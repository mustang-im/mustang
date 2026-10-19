import type { PublicKey } from "../../../logic/Mail/Encryption/PublicKey";
import { TrustLevel } from "../../../logic/Mail/Encryption/enums";
import { gt } from "../../../l10n/l10n";

export function certificateStatus(key: PublicKey): string {
  if (key.trustLevel == TrustLevel.Distrusted) {
    return gt`Not trusted`;
  }
  if (key.obsolete) {
    return key.expires && key.expires.getTime() < Date.now() ? gt`Expired` : gt`Not used`;
  }
  return key.encryptByDefault ? gt`Default` : "";
}
