{#if meeting && $meeting.state == MeetingState.Ongoing}
  <InMeeting {meeting} />
{:else if meeting && $meeting.state != MeetingState.Ended}
  <Calling {meeting} />
{:else}
  <StartScreen />
{/if}

<script lang="ts">
  import { MeetingState, type VideoConfMeeting } from "../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../logic/app";
  import InMeeting from "./InMeeting.svelte";
  import Calling from "./Start/Calling.svelte";
  import StartScreen from "./Start/StartScreen.svelte";

  export let meetingFromRoute: VideoConfMeeting | null = null;

  $: meetings = appGlobal.meetings;
  $: meeting = meetingFromRoute ?? $meetings.first;
</script>
