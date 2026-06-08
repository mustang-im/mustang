{#if meeting && $meeting.state == MeetingState.Ongoing}
  <InMeeting {meeting} />
{:else if meeting}
  <Calling {meeting} />
{:else if isPhoneDial}
  <PhoneDialScreen bind:isPhoneDial />
{:else}
  <StartScreen bind:isPhoneDial />
{/if}

<script lang="ts">
  import { MeetingState } from "../../logic/Meet/VideoConfMeeting";
  import { appGlobal } from "../../logic/app";
  import InMeeting from "./InMeeting.svelte";
  import Calling from "./Start/Calling.svelte";
  import PhoneDialScreen from "./Start/Phone/PhoneDialScreen.svelte";
  import StartScreen from "./Start/StartScreen.svelte";

  // HACK: Why are some ended meetings not removed? See `VideoConfMeeting.hangup()`
  $: meetings = appGlobal.meetings.filterObservable(m => m.state != MeetingState.Ended);
  $: meeting = $meetings.first;
  let isPhoneDial = false;
</script>
