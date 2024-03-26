<vbox>
  <h2>Manual configuration</h2>
  <hbox class="subtitle">Your email provider or company can tell you these details.</hbox>

  <grid class="manual-config">
    <hbox class="header">
      <hbox class="direction"><ArrowRightIcon /></hbox>
      Incoming server
    </hbox>
    <hbox></hbox>
    <ManualConfigServer {config} bind:this={incomingEl} />

    <hbox class="header">
      <hbox class="direction"><ArrowLeftIcon /></hbox>
      Outgoing server
    </hbox>
    <hbox></hbox>
    <ManualConfigServer config={config.outgoing} bind:this={outgoingEl} />
  </grid>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import ManualConfigServer from "./ManualConfigServer.svelte";
  import ArrowLeftIcon from "lucide-svelte/icons/arrow-big-left";
  import ArrowRightIcon from "lucide-svelte/icons/arrow-big-right";

  /** in */
  export let config: MailAccount;

  let incomingEl: ManualConfigServer;
  let outgoingEl: ManualConfigServer;

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
    grid-template-columns: auto auto;
  }
  grid :global(> *) {
    align-items: end;
  }
  .header {
    font-weight: bold;
    font-size: 18px;
    margin-top: 24px;
    margin-bottom: 8px;
  }
  .header .direction {
    margin-right: 6px;
  }
</style>
