{#if meeting && $meeting.state == MeetingState.Ongoing}
  <InMeeting {meeting} />
{:else if meeting && $meeting.state != MeetingState.Ended}
  <Calling {meeting} />
{:else}
  <LogoScreen />
{/if}

<script lang="ts">
  import { MeetingState } from "../../../logic/Meet/VideoConfMeeting";
  import { LiveKitConf } from "../../../logic/Meet/LiveKit/LiveKitConf";
  import { LiveKitAccount } from "../../../logic/Meet/LiveKit/LiveKitAccount";
  import { appGlobal } from "../../../logic/app";
  import InMeeting from "../InMeeting.svelte";
  import Calling from "../Start/Calling.svelte";
  import LogoScreen from "./LogoScreen.svelte";
  import { catchErrors } from "../../Util/error";
  import { onMount } from "svelte";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;

  onMount(() => catchErrors(getMeeting));
  async function getMeeting() {
    let urlObj = window.location;
    let anchor = new URLSearchParams(urlObj.hash);
    let myName = anchor.get("name");
    appGlobal.me.name = myName;

    let account = new LiveKitAccount();
    account.url = "https://" + urlObj.host;
    let meeting = new LiveKitConf(account);
    meeting.webSocketURL = "wss://" + urlObj.host;
    appGlobal.meetAccounts.add(account);
    appGlobal.meetings.add(meeting);

    await meeting.joinWithInvitation(urlObj.href);
  }
</script>
