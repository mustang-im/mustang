<vbox>
  <h1>Debug</h1>
  <button on:click={() => logHistory.clear()}>Clear log history</button>
  <div class="log-history">
    {#each $logHistory.each as log, i}
      <div>{i}: {log}</div>
    {/each}
  </div>
</vbox>

<script lang="ts">
  import { logHistory } from "./LogHistory";
</script>

<style>
  .log-history {
    max-height: 500px;
    overflow-y: auto;
  }
</style>
