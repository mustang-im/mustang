{#if meeting}
  <InMeeting {meeting}/>
{:else}
  <StartScreen />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { sidebarApp, selectedApp, AppArea } from "../MainWindow/app";
  import InMeeting from "./InMeeting.svelte";
  import StartScreen from "./Start/StartScreen.svelte";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;
  // $: $sidebarApp = appGlobal.meetings.hasItems && $selectedApp != AppArea.Meet ? AppArea.Meet : null;
</script>

<style>
</style>
