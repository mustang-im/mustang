{#if meeting && $meeting.state == MeetingState.Ongoing}
  <InMeeting {meeting} />
{:else if meeting && $meeting.state != MeetingState.Ended}
  <Calling {meeting} />
{:else}
  <StartScreen />
{/if}

<script lang="ts">
  import { MeetingState } from "../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../logic/app";
  import { sidebarApp, selectedApp, AppArea } from "../MainWindow/app";
  import InMeeting from "./InMeeting.svelte";
  import Calling from "./Start/Calling.svelte";
  import StartScreen from "./Start/StartScreen.svelte";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;
  // $: $sidebarApp = appGlobal.meetings.hasItems && $selectedApp != AppArea.Meet ? AppArea.Meet : null;
</script>

<style>
</style>
