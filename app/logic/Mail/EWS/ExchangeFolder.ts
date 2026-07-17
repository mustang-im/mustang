import { Folder } from "../Folder";
import { gt } from "../../../l10n/l10n";

export class ExchangeFolder extends Folder {
  disableChangeSpecial(): string | false {
    return gt`You cannot change special folders on the Exchange server`;
  }
}

// <https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxprops/77844470-22ca-43fb-993d-c53e96cf9cd6>
export const MessageFlagsPidTag = "0x0E07";
// <https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxprops/eeca3a02-14e7-419b-8918-986275a2fac0>
export const IconIndexPidTag = "0x1080";
