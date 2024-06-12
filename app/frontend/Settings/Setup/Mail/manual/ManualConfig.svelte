<grid class="manual-config" full={stepFull}>
  <ManualConfigLabels {stepFull} />
  <ManualConfigServer {config} bind:this={incomingEl} bind:stepFull />
  {#if config.outgoing}
    <ManualConfigServer config={config.outgoing} bind:this={outgoingEl} {stepFull} />
  {/if}
</grid>

{#if config.oAuth2}
  <OAuth2Manual {config} />
{/if}

<hbox flex />
<hbox class="buttons">
  <Button label="Save"
    classes="save"
    icon={SaveIcon}
    onClick={onSave}
    />
  <slot name="buttons-bottom-right" />
</hbox>

<script lang="ts">
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import Button from "../../../../Shared/Button.svelte";
  import ManualConfigLabels from "./ManualConfigLabels.svelte";
  import ManualConfigServer from "./ManualConfigServer.svelte";
  import OAuth2Manual from "./OAuth2Manual.svelte";
  import SaveIcon from "lucide-svelte/icons/save";

  /** in */
  export let config: MailAccount;
  export let stepFull = true;

  /** out only */
  export let incomingEl: ManualConfigServer = null;
  export let outgoingEl: ManualConfigServer = null;

  async function onSave() {
    await config.save();
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
  .buttons {
    justify-content: end;
    margin-top: 16px;
  }
  .buttons :global(button) {
    margin-left: 8px;
  }
</style>
