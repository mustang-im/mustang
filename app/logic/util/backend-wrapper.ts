import { appGlobal } from "../app";
// #if [MOBILE]
import { FileViewer } from "@capacitor/file-viewer";
// #endif

/** Open the native desktop app with this file */
export async function openOSAppForFile(filePath: string, mimeType: string) {
  // #if [MOBILE]
  await FileViewer.openDocumentFromLocalPath({ path: filePath });
  // #else
  await appGlobal.remoteApp.openFileInNativeApp(filePath, mimeType);
  // #endif
}

/** Open the native file manager with the folder
 * where this file is, and select this file. */
export async function openOSFolder(filePath: string) {
  await appGlobal.remoteApp.showFileInFolder(filePath);
}
