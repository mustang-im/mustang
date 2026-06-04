import { File } from '../../logic/Files/File';
import { startWebApp } from '../WebApps/Runner/open';
import { getUILocale, gt } from '../../l10n/l10n';
import { assert } from '../../logic/util/util';
import prettyBytes from 'pretty-bytes';

export function fileSize(sizeInBytes: number) {
  return prettyBytes(sizeInBytes, {
    binary: true,
    locale: getUILocale(),
    maximumFractionDigits: 0,
  }).replace("i", "");
}

/** Open preferred web app from cloud provider */
export async function openFileInCloudApp(file: File) {
  assert(file instanceof File, "Need file");
  let editor = await file.preferredOnlineEditor();
  assert(file instanceof File, gt`No cloud editor available on ${file.account.name}`);
  let webApp = editor.instantiate(file.parent?.account);
  startWebApp(webApp);
}

/** Open preferred app for file type, either local or cloud */
export async function openFileInDefaultApp(file: File) {
  assert(file instanceof File, "Need file");
  // Open web app from cloud provider
  let editor = await file.preferredOnlineEditor();
  if (editor) {
    let webApp = editor.instantiate(file.parent?.account);
    startWebApp(webApp);
    return;
  }
  // Open native desktop app
  await file.openOSApp();
}
