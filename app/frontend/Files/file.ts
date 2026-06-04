import { File } from '../../logic/Files/File';
import { startWebApp } from '../WebApps/Runner/open';
import { getUILocale } from '../../l10n/l10n';
import { assert } from '../../logic/util/util';
import prettyBytes from 'pretty-bytes';

export function fileSize(sizeInBytes: number) {
  return prettyBytes(sizeInBytes, {
    binary: true,
    locale: getUILocale(),
    maximumFractionDigits: 0,
  }).replace("i", "");
}

export async function openFileInDefaultApp(file: File) {
  assert(file instanceof File, "Need file");
  // Open web app from cloud provider
  let editors = await file.availableOnlineEditors();
  if (editors.hasItems) {
    let webApp = editors.first.instantiate(file.parent?.account);
    startWebApp(webApp);
    return;
  }
  // Open native desktop app
  await file.openOSApp();
}
