import { getMailSelection } from "./Selected";
import type { SearchView } from "./LeftPane/SearchSwitcher.svelte";
import { mailMustangApp } from "./MailMustangApp";
import { getNavigation } from "../AppsBar/selectedApp";
import type { AppWindow } from "../MainWindow/AppWindow";
import { appGlobal } from "../../logic/app";
import type { EMail } from "../../logic/Mail/EMail";
import { URLPart } from "../Util/util";
import { assert } from "../../logic/util/util";
import { tick } from "svelte";

export async function openEMailMessage(message: EMail, appWindow: AppWindow, tab?: SearchView) {
  assert(message.folder?.account, "no account for email");
  let { selectedAccount, selectedFolder, selectedMessage, selectedSearchTab } = getMailSelection(appWindow.mainWindow);
  let { goTo, openApp, bringAppToFront } = getNavigation(appWindow);
  selectedAccount.set(message.folder?.account);
  selectedFolder.set(message.folder);
  selectedMessage.set(message);
  if (tab) {
    selectedSearchTab.set(tab);
  }

  if (appGlobal.isMobile) { // TODO unify
    goTo(URLPart`/mail/message/${message.folder.account.id}/${message.folder.id}/${message.id}/display`, {
      message: message,
      folder: message.folder,
      account: message.folder?.account,
      tab: tab,
    });
  } else {
    openApp(mailMustangApp, {
      message: message,
      folder: message.folder,
      account: message.folder?.account,
      tab: tab,
    });
  }
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }

  await tick();
  selectedAccount.set(message.folder?.account);
  selectedFolder.set(message.folder);
  selectedMessage.set(message);
  if (tab) {
    selectedSearchTab.set(tab);
  }
}

export function openComposer(mail: EMail, appWindow: AppWindow) {
  mailMustangApp.writeMail(mail, appWindow);
}
