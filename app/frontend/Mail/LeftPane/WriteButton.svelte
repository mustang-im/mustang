<RoundButton
  label={$t`Write new email`}
  icon={WriteIcon}
  classes="create"
  disabled={!account}
  onClick={newMail}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { mailMustangApp } from "../MailMustangApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";

  export let account: MailAccount; /* in/out */

  function newMail() {
    assert(account, gt`Please select a mail account first`);
    let email = account.newEMailFrom();
    mailMustangApp.writeMail(email);
  }
</script>
