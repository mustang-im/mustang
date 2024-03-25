<RoundButton
  label="Write new email"
  icon={WriteIcon} classes="create"
  disabled={!selectedAccount}
  on:click={() => catchErrors(newMail)}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { mailMustangApp } from "../MailMustangApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { catchErrors } from "../../Util/error";

  export let selectedAccount: MailAccount; /* in/out */

  function newMail() {
    let folder = selectedAccount.drafts ??
      selectedAccount.sent ??
      selectedAccount.inbox ??
      selectedAccount.rootFolders.first;
    let mail = folder.newEMail();
    mail.from.emailAddress = selectedAccount.emailAddress;
    mail.from.name = selectedAccount.userRealname;
    mailMustangApp.writeMail(mail);
  }
</script>
