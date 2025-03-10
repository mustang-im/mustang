<grid class="manual-config" full={stepFull}>
  <ManualConfigHostLabels {stepFull} />
  <ManualConfigHostServer bind:config bind:stepFull {isSetup} bind:this={incomingEl} on:continue={onContinue} />
  {#if outgoing}
    <ManualConfigHostServer bind:config={outgoing} {stepFull} {isSetup} bind:this={outgoingEl} on:continue={onContinue} />
  {/if}
</grid>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import ManualConfigHostLabels from "./ManualConfigHostLabels.svelte";
  import ManualConfigHostServer from "./ManualConfigHostServer.svelte";

  /** in/out */
  export let config: MailAccount;
  /** false = show hostnames only, true = show all fields.
   * in/out */
  export let stepFull: boolean;
  export let isSetup = false;

  $: outgoing = $config.outgoing;
  let incomingEl: ManualConfigHostServer = null;
  let outgoingEl: ManualConfigHostServer = null;

  /** If the user pressed the [Next] button,
   * are we able to move on?
   * @returns true = can continue, false or exception: Don't continue */
  export async function onContinue(): Promise<boolean> {
    return await incomingEl.onContinue() && (!outgoing || await outgoingEl.onContinue());
  }
</script>

<style>
  grid {
    grid-auto-flow: column;
    grid-template-rows: auto auto auto;
    grid-auto-columns: max-content auto auto;
    row-gap: 12px;
  }
  grid[full=true] {
    grid-template-rows: auto auto auto auto auto auto auto auto;
  }
  grid :global(> *) {
    align-items: end;
  }

  /* Style */

  grid {
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-block-start: 24px;
    padding-block-end: 20px;
  }
  grid :global(.header) {
    background-color: var(--headerbar-bg);
    color: var(--headerbar-fg);
    padding-block-start: 8px;
    padding-block-end: 8px;
    padding-inline-start: 8px;
    font-size: 14px;
    border-bottom: 1px solid var(--border);
  }
  grid :global(> *) {
    padding-inline-start: 16px;
    padding-inline-end: 16px;
  }
</style>
