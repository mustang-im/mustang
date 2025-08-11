{#if meeting && $meeting.state == MeetingState.Ongoing}
  <InMeeting {meeting} />
{:else if meeting && $meeting.state != MeetingState.Ended}
  <Calling {meeting} />
{:else}
  <StartScreen />
{/if}

<script lang="ts">
  import { onMount } from "svelte";
  import { MeetingState } from "../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../logic/app";
  import { catchErrors } from "../Util/error";
  import InMeeting from "./InMeeting.svelte";
  import Calling from "./Start/Calling.svelte";
  import StartScreen from "./Start/StartScreen.svelte";
  import { assert } from "../../logic/util/util";
  import { LiveKitConf } from "../../logic/Meet/LiveKit/LiveKitConf";
  import { LiveKitAccount } from "../../logic/Meet/LiveKit/LiveKitAccount";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;

  onMount(() => catchErrors(getMeeting));
  async function getMeeting() {
    let url = window.location;
    let account = new LiveKitAccount();
    account.url = "https://" + url.host;
    let meeting = new LiveKitConf(account);
    meeting.webSocketURL = "wss://" + url.host;
    appGlobal.meetAccounts.add(account);
    appGlobal.meetings.add(meeting);
    await meeting.joinWithInvitation(url.href);
  }
</script>
