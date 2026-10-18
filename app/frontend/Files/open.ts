import type { File as FileEntry } from "../../logic/Files/File";
import { filesMustangApp } from "./FilesMustangApp";
import { getFilesSelection } from "./selected";
import { getNavigation } from "../AppsBar/selectedApp";
import type { AppWindow } from "../MainWindow/AppWindow";
import { openEMailMessage } from "../Mail/open";
import { allAccountsAccount } from "../../logic/Mail/AccountsList/ShowAccounts";
import { appGlobal } from "../../logic/app";
import { assert } from "../../logic/util/util";

export function openFileFromOtherApp(file: FileEntry, appWindow: AppWindow) {
  let { goTo, openApp, bringAppToFront } = getNavigation(appWindow);
  getFilesSelection(appWindow.mainWindow).selectedFile.set(file);
  if (appGlobal.isMobile) {
    goTo("files/file", { file });
  } else {
    openApp(filesMustangApp, { file });
  }
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }
}

export function canOpenFileInternally(mimeType: string): boolean {
  return mimeType == "message/rfc822";
}

export async function openFileInternallyFromFile(file: File, appWindow: AppWindow) {
  if (file && canOpenFileInternally(file.type)) {
    await openFileInternally(new Uint8Array(await file.arrayBuffer()), file.type, appWindow);
  }
}

/**
 * File an appropriate internal viewer for the file of type `mimeType`.
 * @returns whether internal viewer was found
 */
export async function openFileInternally(fileContents: Uint8Array, mimeType: string, appWindow: AppWindow) {
  if (mimeType == "message/rfc822") {
    await openEMail(fileContents, appWindow);
    return true;
  }
  return false;
}

async function openEMail(mime: Uint8Array, appWindow: AppWindow) {
  let folder = allAccountsAccount.inbox; // copy to folder must be a different account
  assert(folder, "Need folder");
  let email = folder.newEMail();
  email.mime = mime;
  await email.parseMIME();
  await openEMailMessage(email, appWindow);
}
