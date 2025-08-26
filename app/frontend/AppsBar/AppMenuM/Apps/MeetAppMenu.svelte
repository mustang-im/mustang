<AccountButton account={appGlobal.meetAccounts.get(1)} page={acc => `/meet/account/${acc.id}/create`} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.meetAccounts.get(0)} page={acc => `/meet/account/${acc.id}/create`} defaultIcon={AccountIcon} />
<AppButton app={meetMustangApp} page="/meet/" />
<CombinedButton icon1={meetMustangApp.icon} icon2={HistoryIcon} page="/meet/history" />
<CombinedButton icon1={meetMustangApp.icon} icon2={PlusIcon} onClick={onCreateMeeting} />

<script lang="ts">
  import { meetMustangApp } from "../../../Meet/MeetMustangApp";
  import { startAdHocMeeting } from "../../../Meet/Start/start";
  import { openApp } from "../../selectedApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import HistoryIcon from "lucide-svelte/icons/history";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import AccountIcon from "lucide-svelte/icons/video";

  async function onCreateMeeting() {
    let meeting = await startAdHocMeeting();
    openApp(meetMustangApp, { meeting });
  }
</script>
