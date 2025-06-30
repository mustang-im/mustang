<svelte:window />

<script lang="ts">
  import { newMailListener } from "./NotifyNewMail";
  import { linkClickURL } from "../MainWindow/Selected";
  import { mailMustangApp } from "./MailMustangApp";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";
  import { assert, type URLString } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  $: emailAccounts = appGlobal.emailAccounts;
  $: catchErrors(() => newMailListener($emailAccounts));

  $: startupArgs = $emailAccounts.hasItems ? appGlobal.remoteApp?.startupArgs : null;
  $: catchErrors(() => startupArgs ? runURL($startupArgs.url) : null);
  $: catchErrors(() => runURL($linkClickURL));
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
    console.log("mailto: handler", url);
    let account = emailAccounts.first;
    assert(account, $t`Please set up an email account before sending mail`);
    let mail = account.newEMailFrom();
    mail.compose.populateFromMailtoURL(url);
    mailMustangApp.writeMail(mail);
    window.focus();
    appGlobal.remoteApp.unminimizeMainWindow();
  }
</script>
