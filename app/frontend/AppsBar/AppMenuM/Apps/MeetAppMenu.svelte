<AccountButton account={appGlobal.meetAccounts.get(1)} page={acc => `/meet/account/${acc.id}/create`} />
<AccountButton account={appGlobal.meetAccounts.get(0)} page={acc => `/meet/account/${acc.id}/create`} />
<AppButton app={meetMustangApp} page="/meet/" />
<CombinedButton icon1={meetMustangApp.icon} icon2={HistoryIcon} page="/meet/history" />
<CombinedButton icon1={meetMustangApp.icon} icon2={PlusIcon} page="/meet/create" />

<script lang="ts">
  import { meetMustangApp } from "../../../Meet/MeetMustangApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import HistoryIcon from "lucide-svelte/icons/history";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
</script>
