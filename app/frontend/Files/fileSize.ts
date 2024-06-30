import prettyBytes from 'pretty-bytes';
import { getUILocale } from '../../l10n/l10n';

export function fileSize(sizeInBytes: number) {
  return prettyBytes(sizeInBytes, {
    binary: true,
    locale: getUILocale(),
    maximumFractionDigits: 0,
  })
    .replace("i", "");
}
