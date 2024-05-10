<grid class="manual-config" full={stepFull}>
  <ManualConfigLabels {stepFull} />
  <ManualConfigServer {config} bind:this={incomingEl} bind:stepFull />
  {#if config.outgoing}
    <ManualConfigServer config={config.outgoing} bind:this={outgoingEl} {stepFull} />
  {/if}
</grid>

<script lang="ts">
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import ManualConfigLabels from "./ManualConfigLabels.svelte";
  import ManualConfigServer from "./ManualConfigServer.svelte";

  /** in */
  export let config: MailAccount;
  export let stepFull = true;

  /** out only */
  export let incomingEl: ManualConfigServer = null;
  export let outgoingEl: ManualConfigServer = null;
</script>

<style>
  grid {
    grid-auto-flow: column;
    grid-template-rows: auto auto auto;
    grid-auto-columns: max-content auto auto;
    row-gap: 12px;
  }
  grid[full=true] {
    grid-template-rows: auto auto auto auto auto auto auto;
  }
  grid :global(> *) {
    align-items: end;
  }

  /* Style */

  grid {
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-top: 24px;
    padding-bottom: 20px;
  }
  grid :global(.header) {
    background-color: var(--headerbar-bg);
    color: var(--headerbar-fg);
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    font-size: 14px;
    border-bottom: 1px solid var(--border);
  }
  grid :global(> *) {
    padding-left: 16px;
    padding-right: 16px;
  }
</style>
