<vbox class="app">
  {#if appGlobal.meeting }
    <vbox class="participants">
      {#each appGlobal.meeting.participants.each as participant (participant.id)}
        <Participant {participant} />
      {/each}
    </vbox>
  {:else}
    Start meeting with somebody
  {/if}
</vbox>

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import Participant from "./Participant.svelte";
</script>

<style>
  .app {
    flex: 1 0 0;
  }
  .participants {
    display: grid;
    grid-template-columns: auto auto auto;
  }
</style>
