<AccountButton account={appGlobal.emailAccounts.get(1)} {goToAccount} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.emailAccounts.get(0)} {goToAccount} defaultIcon={AccountIcon} />
<AppButton app={mailMustangApp} page="/mail/" />
<CombinedButton icon1={mailMustangApp.icon} icon2={SearchIcon} page="/mail/search" />
<CombinedButton icon1={mailMustangApp.icon} icon2={PencilIcon} page="/mail/compose" />

<script lang="ts">
  import { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { mailMustangApp } from "../../../Mail/MailMustangApp";
  import { selectedAccount, selectedFolder } from "../../../Mail/Selected";
  import { goTo } from "../../selectedApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PencilIcon from "lucide-svelte/icons/pencil";
  import AccountIcon from "lucide-svelte/icons/inbox";

  function goToAccount(account: MailAccount) {
    $selectedAccount = account;
    $selectedFolder = account.inbox;
    goTo(`/mail/folder/${account.id}/${account.inbox.id}/message-list`);
  }
</script>
