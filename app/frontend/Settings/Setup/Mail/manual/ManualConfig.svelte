<grid class="manual-config" full={stepFull}>
  <ManualConfigLabels {stepFull} />
  <ManualConfigServer {config} bind:this={incomingEl} bind:stepFull {isSetup} />
  {#if config.outgoing}
    <ManualConfigServer config={config.outgoing} bind:this={outgoingEl} {stepFull} {isSetup} />
  {/if}
</grid>

{#if config.oAuth2}
  <OAuth2Manual {config} />
{/if}

{#if !isSetup}
  <hbox flex />
  <hbox class="buttons">
    <Button label={$t`Save`}
      classes="save"
      icon={SaveIcon}
      onClick={onSave}
      />
    <slot name="buttons-bottom-right" />
  </hbox>
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../../../logic/Mail/MailAccount";
  import Button from "../../../../Shared/Button.svelte";
  import ManualConfigLabels from "./ManualConfigLabels.svelte";
  import ManualConfigServer from "./ManualConfigServer.svelte";
  import OAuth2Manual from "./OAuth2Manual.svelte";
  import SaveIcon from "lucide-svelte/icons/save";
  import { t } from "../../../../../l10n/l10n";

  /** in */
  export let config: MailAccount;
  export let stepFull = true;
  export let isSetup = false;

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
  .buttons {
    justify-content: end;
    margin-block-start: 16px;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
</style>
