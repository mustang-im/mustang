<RoundButton
  label="Write new email"
  icon={WriteIcon} classes="create"
  disabled={!selectedAccount}
  onClick={newMail}
  />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { SpecialFolder } from "../../../logic/Mail/Folder";
  import { mailMustangApp } from "../MailMustangApp";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import WriteIcon from "lucide-svelte/icons/pencil";

  export let selectedAccount: MailAccount; /* in/out */

  function newMail() {
    let folder = selectedAccount.getSpecialFolder(SpecialFolder.Drafts);
    let mail = folder.newEMail();
    mail.needToLoadBody = false;
    mail.from.emailAddress = selectedAccount.emailAddress;
    mail.from.name = selectedAccount.userRealname;
    mailMustangApp.writeMail(mail);
  }
</script>
