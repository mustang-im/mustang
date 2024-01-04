{#if meeting}
  <InMeeting {meeting} sidebar={true} />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import InMeeting from "./InMeeting.svelte";

  $: meetings = appGlobal.meetings;
  $: meeting = $meetings.first;
</script>

<style>
</style>
