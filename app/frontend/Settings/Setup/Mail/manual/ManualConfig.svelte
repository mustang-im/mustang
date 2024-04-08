<vbox>
  <h2>Manual configuration</h2>
  <hbox class="subtitle">Your email provider or company can tell you these details.</hbox>

  <grid class="manual-config" full={stepFull}>
    <ManualConfigLabels {stepFull} />
    <ManualConfigServer {config} bind:this={incomingEl} bind:stepFull />
    <ManualConfigServer config={config.outgoing} bind:this={outgoingEl} {stepFull} />
  </grid>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import ManualConfigLabels from "./ManualConfigLabels.svelte";
  import ManualConfigServer from "./ManualConfigServer.svelte";

  /** in */
  export let config: MailAccount;
  export let abort: AbortController;

  let incomingEl: ManualConfigServer;
  let outgoingEl: ManualConfigServer;
  let stepFull = false;

  /** User just pressed the [Next] button */
  export async function onContinue(): Promise<boolean> {
    return await incomingEl.onContinue() &&
      await outgoingEl.onContinue();
  }
</script>

<style>
  h2 {
    margin-bottom: 0px;
  }
  grid {
    grid-auto-flow: column;
    grid-template-rows: auto auto auto;
    grid-auto-columns: max-content auto auto;
    column-gap: 24px;
  }
  grid[full=true] {
    grid-template-rows: auto auto auto auto auto auto auto;
  }
  grid :global(> *) {
    align-items: end;
  }
</style>
