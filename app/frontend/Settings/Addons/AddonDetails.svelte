<vbox class="addon-details">
  {#if $addon.manifest.description}
    <div class="description">{$addon.manifest.description}</div>
  {/if}
  <grid class="facts">
    {#if $addon.manifest.author}
      <hbox class="fact-label">{$t`Author *=> of an addon`}</hbox>
      <div class="fact-value author">{$addon.manifest.author}</div>
    {/if}
    {#if $addon.manifest.homepage}
      <hbox class="fact-label">{$t`Website`}</hbox>
      <div class="fact-value">
        <a class="homepage" href={$addon.manifest.homepage} target="_blank" rel="noopener noreferrer">{$addon.manifest.homepage}</a>
      </div>
    {/if}
  </grid>
  <vbox class="granted">
    <hbox class="granted-header">
      {#if $grantedPermissions.hasItems}
        {$t`It can *=> Followed by a list of what an addon is allowed to do`}
      {:else}
        {$t`It needs no permissions *=> An addon`}
      {/if}
    </hbox>
    <AddonPermissions permissions={grantedPermissions} />
  </vbox>
  <hbox class="buttons">
    <Button
      label={$t`Remove`}
      icon={RemoveIcon}
      classes="remove"
      onClick={onRemove}
      />
  </hbox>
</vbox>

<script lang="ts">
  import type { Addon } from "../../../logic/Addons/Addon";
  import AddonPermissions from "./AddonPermissions.svelte";
  import Button from "../../Shared/Button.svelte";
  import RemoveIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let addon: Addon;

  $: grantedPermissions = addon.grantedPermissions;

  async function onRemove() {
    let question = addon.manifest.protocols.hasItems
      ? $t`Do you want to remove the addon ${addon.name}? Your accounts that use it stay, but they don't work until you install it again.`
      : $t`Do you want to remove the addon ${addon.name}?`;
    if (!confirm(question)) {
      return;
    }
    await addon.uninstall();
  }
</script>

<style>
  .addon-details {
    gap: 12px;
    padding: 4px 4px 12px 48px;
    min-width: 0;
  }
  .description {
    overflow-wrap: anywhere;
  }
  .facts {
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: 16px;
    row-gap: 4px;
  }
  .fact-label {
    opacity: 70%;
  }
  .fact-value {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .granted {
    gap: 4px;
  }
  .granted-header {
    font-weight: bold;
  }
  .buttons {
    justify-content: end;
  }
</style>
