<RoundButton
  label={$t`Write new email`}
  icon={WriteIcon} classes="create"
  disabled={!selectedAccount}
  onClick={newMail}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { mailMustangApp } from "../MailMustangApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { assert } from "../../../logic/util/util";
  import { gt, t } from "../../../l10n/l10n";

  export let selectedAccount: MailAccount; /* in/out */
  export let to: PersonUID | null = null;

  function newMail() {
    assert(selectedAccount, gt`Please select a mail account first`);
    let email = selectedAccount.newEMailFrom();
    if (to) {
      email.to.add(to);
    }
    mailMustangApp.writeMail(email);
  }
</script>
