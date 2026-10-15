import { appGlobal } from "../../logic/app";
// #if [!WEBMAIL]
// @ts-ignore ts2300
import { getStartObjects, loginOnStartup } from "../../logic/startup";
import { predefinedConfig } from "../../logic/Mail/AutoConfig/predefinedConfig";
// #else
// @ts-ignore ts2300
import { getStartObjects, loginOnStartup } from "../../logic/WebMail/startup";
// #endif
import { goTo, openApp } from "../../frontend/AppsBar/selectedApp";
import { loadMustangApps } from "../../frontend/AppsBar/loadMustangApps";
import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
import { selectedAccount } from "../../frontend/Mail/Selected";

export class Startup {
  async start() {
    // <copied from="../../frontend/MainWindow/MainWindow.svelte">
    loadMustangApps();
    openApp(mailMustangApp, {});
    await this.startup();
    // </copied>
  }

  protected async startup() {
    // <copied from="../../frontend/MainWindow/MainWindow.svelte">
    await getStartObjects();
    if (appGlobal.emailAccounts.isEmpty && appGlobal.chatAccounts.isEmpty) {
      await this.setup();
    } else {
      await loginOnStartup(console.error);
      // Setting $selectedApp late would overwrite commandline/URL handlers
      selectedAccount.set(appGlobal.emailAccounts.first);
      // `MailApp` selects the inbox, once we read the folders
    }
    // </copied>
  }

  protected async setup() {
    // <copied from="../../frontend/MainWindow/MainWindow.svelte">
    // #if [!WEBMAIL]
    let account = await predefinedConfig();
    if (account) {
      goTo("/setup/predefined", { account });
    } else {
      goTo("/setup/initial", {});
    }
    // #endif
    // </copied>
  }
}
