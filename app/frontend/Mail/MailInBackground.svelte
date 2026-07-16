<svelte:window on:url-mailto|capture={(event) => onMailto(event.url)} />

<script lang="ts">
  import { newMailListener } from "./NotifyNewMail";
  import { mailMustangApp } from "./MailMustangApp";
  import { draftRecovery } from "../../logic/Mail/DraftRecovery";
  import { openFileInternally } from "../Files/open";
  import { bringAppToFront } from "../AppsBar/selectedApp";
  import { selectedFolder } from "./Selected";
  import { appGlobal } from "../../logic/app";
  import { backgroundError, catchErrors } from "../Util/error";
  import { assert, sleep, type URLString } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";
  import { onMount } from "svelte";

  onMount(() => {
    newMailListener();
  });

  $: emailAccounts = appGlobal.emailAccounts;
  $: startupArgs = $emailAccounts.hasItems ? appGlobal.remoteApp?.startupArgs : null;

  let recoveredDrafts = false;
  $: if ($emailAccounts.hasItems && !recoveredDrafts) {
    recoveredDrafts = true;
    catchErrors(restoreRecoveredDrafts, backgroundError);
  }

  /** Re-open composers for drafts that a crash or unexpected shutdown left
   * behind. They appear as compose subapps with their previous state, but are
   * not brought to the front unrequested. @see DraftRecovery */
  async function restoreRecoveredDrafts() {
    for (let record of await draftRecovery.getAll()) {
      let account = emailAccounts.find(acc => acc.id == record.accountID) ?? emailAccounts.first;
      if (!account) {
        continue;
      }
      let mail = account.newEMailFrom();
      mail.messageID = record.messageID;
      mail.mime = record.mime instanceof Uint8Array ? record.mime : new Uint8Array(record.mime);
      await mail.parseMIME();
      mailMustangApp.writeMail(mail, false);
    }
  }
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
      await openFileInternally(mime, "message/rfc822");
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
