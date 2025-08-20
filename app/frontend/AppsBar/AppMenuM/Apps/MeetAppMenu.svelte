<AccountButton account={appGlobal.meetAccounts.get(1)} page={acc => `/meet/account/${acc.id}/create`} defaultIcon={AccountIcon} />
<AccountButton account={appGlobal.meetAccounts.get(0)} page={acc => `/meet/account/${acc.id}/create`} defaultIcon={AccountIcon} />
<AppButton app={meetMustangApp} page="/meet/" />
<CombinedButton icon1={meetMustangApp.icon} icon2={HistoryIcon} page="/meet/history" />
<CombinedButton icon1={meetMustangApp.icon} icon2={PlusIcon} onClick={onCreateMeeting} />

<script lang="ts">
  import { meetMustangApp } from "../../../Meet/MeetMustangApp";
  import { getMeetAccount } from "../../../../logic/Meet/AccountsList/MeetAccounts";
  import type { VideoConfMeeting } from "../../../../logic/Meet/VideoConfMeeting";
  import { openApp } from "../../selectedApp";
  import { appGlobal } from "../../../../logic/app";
  import AccountButton from "../AccountButton.svelte";
  import AppButton from "../AppButton.svelte";
  import CombinedButton from "../CombinedButton.svelte";
  import HistoryIcon from "lucide-svelte/icons/history";
  import PlusIcon from "lucide-svelte/icons/plus-circle";
  import AccountIcon from "lucide-svelte/icons/video";
  import { catchErrors } from "../../../Util/error";

  async function onCreateMeeting() {
    let meeting: VideoConfMeeting;
    if (appGlobal.meetAccounts.hasItems) {
      meeting = await createMeeting();
    } else {
      // Wait for Meet start page to check the license and create the meeting account
      let unsubscribe = appGlobal.meetAccounts.subscribe(() => catchErrors(async () => {
        if (appGlobal.meetAccounts.hasItems) {
          await createMeeting();
          unsubscribe();
        }
      }));
      setTimeout(unsubscribe, 3000);
    }
    openApp(meetMustangApp, { meeting });
  }

  async function createMeeting() {
    let meeting = getMeetAccount().newMeeting();
    await meeting.createNewConference();
    appGlobal.meetings.add(meeting);
    return meeting;
  }
</script>
