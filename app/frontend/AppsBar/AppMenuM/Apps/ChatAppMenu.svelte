<AccountButton account={appGlobal.chatAccounts.get(1)} page={acc => `/chat/account/${acc.id}/persons`} />
<AccountButton account={appGlobal.chatAccounts.get(0)} page={acc => `/chat/account/${acc.id}/persons`} />
<AppButton app={chatMustangApp} page="/chat/" />
<CombinedButton icon1={chatMustangApp.icon} icon2={SearchIcon} page="/chat/search" />
<CombinedButton icon1={chatMustangApp.icon} icon2={PencilIcon} page="/chat/" />

<script lang="ts">
  import { chatMustangApp } from "../../../Chat/ChatMustangApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import PencilIcon from "lucide-svelte/icons/pencil";
</script>
