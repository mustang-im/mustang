<AccountButton account={appGlobal.emailAccounts.get(1)} page={acc => `/mail/folder/${acc.id}/${acc.inbox.id}/message-list`} />
<AccountButton account={appGlobal.emailAccounts.get(0)} page={acc => `/mail/folder/${acc.id}/${acc.inbox.id}/message-list`} />
<AppButton app={mailMustangApp} page="/mail/" />
<CombinedButton icon1={mailMustangApp.icon} icon2={SearchIcon} page="/mail/search" />
<CombinedButton icon1={mailMustangApp.icon} icon2={PencilIcon} page="/mail/compose" />

<script lang="ts">
  import { mailMustangApp } from "../../../Mail/MailMustangApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PencilIcon from "lucide-svelte/icons/pencil";
</script>
