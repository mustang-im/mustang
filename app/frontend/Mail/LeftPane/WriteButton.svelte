<RoundButton
  label={$t`Write new email`}
  icon={WriteIcon} classes="create"
  disabled={!selectedAccount}
  onClick={newMail}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { mailMustangApp } from "../MailMustangApp";
  import { appGlobal } from "../../../logic/app";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";

  export let selectedAccount: MailAccount; /* in/out */

  function newMail() {
    let account = selectedAccount ?? appGlobal.emailAccounts.first;
    assert(account, gt`Please set up an email account first`);
    let email = selectedAccount.newEMailFrom();
    mailMustangApp.writeMail(email);
  }
</script>
