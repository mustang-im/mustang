<script lang="ts">
  import { newMailListener } from "./NotifyNewMail";
  import { mailMustangApp } from "./MailMustangApp";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";
  import { assert, sleep, type URLString } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  $: emailAccounts = appGlobal.emailAccounts;
  $: catchErrors(() => newMailListener($emailAccounts));

  $: startupArgs = $emailAccounts.hasItems ? appGlobal.remoteApp?.startupArgs : null;
  $: catchErrors(() => startupArgs ? runStartupURL($startupArgs.url) : null);
  async function runStartupURL(url: URLString) {
    console.log("url handler", url);
    if (!url) {
      return;
    }
    if (url.startsWith("mailto:")) {
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
    window.focus();
    appGlobal.remoteApp.unminimizeMainWindow();
  }
</script>
