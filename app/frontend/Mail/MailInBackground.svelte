<svelte:window on:url-mailto|capture={(event) => onMailto(event.url)} />

<script lang="ts">
  import { newMailListener } from "./NotifyNewMail";
  import { mailMustangApp } from "./MailMustangApp";
  import { openEMailMessage } from "./open";
  import { bringAppToFront } from "../AppsBar/selectedApp";
  import { selectedFolder } from "./Selected";
  import { allAccountsAccount } from "../../logic/Mail/AccountsList/ShowAccounts";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";
  import { assert, sleep, type URLString } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  $: emailAccounts = appGlobal.emailAccounts;
  $: catchErrors(() => newMailListener($emailAccounts));

  $: startupArgs = $emailAccounts.hasItems ? appGlobal.remoteApp?.startupArgs : null;
  $: catchErrors(() => startupArgs?.url ? runURL($startupArgs.url) : null);
  $: catchErrors(() => startupArgs?.file ? openFile($startupArgs.file) : null);

  async function runURL(url: URLString) {
    if (!url) {
      return;
    }
    let urlObj = new URL(url);
    if (urlObj.protocol == "mailto:") {
      startupArgs.handled();
      await onMailto(url);
    }
  }

  async function onMailto(url: URLString) {
    let account = emailAccounts.first;
    assert(account, $t`Please set up an email account before sending mail`);
    let mail = account.newEMailFrom();
    mail.compose.populateFromMailtoURL(url);
    mailMustangApp.writeMail(mail);
    bringAppToFront();
  }

  async function openFile(file: string) {
    if (file.endsWith(".eml")) {
      startupArgs.handled();
      let mime = await appGlobal.remoteApp.readFile(file);

      await waitForStartup();
      let account = allAccountsAccount; // copy to folder must be a different account
      let email = account.inbox.newEMail();
      email.mime = mime;
      await email.parseMIME();
      openEMailMessage(email);
      bringAppToFront();
    }
  }

  async function waitForStartup(): Promise<boolean> {
    if ($selectedFolder) {
      return false;
    }
    let counter = 0;
    while (!$selectedFolder && counter++ < 100) {
      await sleep(0.1);
    }
    return true;
  }
</script>
