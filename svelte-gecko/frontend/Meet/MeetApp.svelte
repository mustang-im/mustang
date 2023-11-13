{#if meeting}
  <InMeeting {meeting}/>
{:else}
  <StartScreen />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import InMeeting from "./InMeeting.svelte";
  import StartScreen from "./Start/StartScreen.svelte";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;
</script>

<style>
</style>
