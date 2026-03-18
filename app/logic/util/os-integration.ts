// #if [MOBILE]
import { Browser } from "@capacitor/browser";
import { FileViewer } from "@capacitor/file-viewer";
// #else
import { appGlobal } from "../app";
// #endif

export async function openExternalURL(url: string) {
  // #if [MOBILE]
  return await Browser.open({ url });
  // #else
  return await appGlobal.remoteApp.openExternalURL(url);
  // #endif
}


/** Open the native desktop app with this file */
export async function openOSAppForFile(filePath: string) {
  // #if [MOBILE]
  await FileViewer.openDocumentFromLocalPath({ path: filePath });
  // #else
  await appGlobal.remoteApp.openFileInNativeApp(filePath);
  // #endif
}
