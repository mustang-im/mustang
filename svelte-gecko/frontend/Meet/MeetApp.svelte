{#if appGlobal.meeting && false}
  <InMeeting />
{:else}
  <StartScreen />
{/if}

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import InMeeting from "./InMeeting.svelte";
  import StartScreen from "./Start/StartScreen.svelte";
</script>

<style>
</style>
