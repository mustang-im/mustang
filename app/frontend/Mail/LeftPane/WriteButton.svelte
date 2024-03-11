<RoundButton
  label="Write new email"
  icon={WriteIcon} classes="create"
  disabled={!selectedAccount}
  on:click={() => catchErrors(newMail)}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/Account";
  import { EMail } from "../../../logic/Mail/EMail";
  import { mailMustangApp } from "../MailMustangApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";
  import { catchErrors } from "../../Util/error";

  export let selectedAccount: MailAccount; /* in/out */

  function newMail() {
    let mail = new EMail();
    mail.authorEmailAddress = selectedAccount.emailAddress;
    mailMustangApp.writeMail(mail);
  }
</script>
