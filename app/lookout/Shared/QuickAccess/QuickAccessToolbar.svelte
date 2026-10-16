{#if $position.value == placement && !$isHidden.value}
  <hbox class="quick-access {placement}" role="toolbar" aria-label={$t`Quick Access Toolbar`}>
    {#each shownCommands as command (command.id)}
      <QuickAccessButton {command} />
    {/each}
    <button type="button" class="customize" bind:this={customizeEl}
      class:open={isMenuOpen}
      title={$t`Customize Quick Access Toolbar`} aria-label={$t`Customize Quick Access Toolbar`}
      aria-haspopup="menu" aria-expanded={isMenuOpen}
      data-keytip-qat="customize"
      on:click|stopPropagation={() => isMenuOpen = !isMenuOpen}>
      <CustomizeIcon size={14} />
    </button>
    <Menu bind:isMenuOpen anchor={customizeEl} placement="bottom-start">
      <MenuLabel label={$t`Customize Quick Access Toolbar`} />
      {#each $commands as command (command.id)}
        <MenuItem label={command.label} checkable
          checked={QuickAccessToolbar.isShown(command, $chosenIDs.value)}
          onClick={() => QuickAccessToolbar.toggle(command, $commands)} />
      {/each}
      <MenuDivider />
      {#if placement == "above"}
        <MenuItem label={$t`Show Below the Ribbon`} onClick={() => QuickAccessToolbar.setPosition("below")} />
      {:else}
        <MenuItem label={$t`Show Above the Ribbon`} onClick={() => QuickAccessToolbar.setPosition("above")} />
      {/if}
      <MenuItem label={$t`Hide Quick Access Toolbar`} onClick={() => QuickAccessToolbar.setHidden(true)} />
    </Menu>
  </hbox>
{/if}

<script lang="ts">
  import { QuickAccessToolbar, type QuickAccessPosition } from "./QuickAccess";
  import QuickAccessButton from "./QuickAccessButton.svelte";
  import Menu from "../Menu/Menu.svelte";
  import MenuItem from "../Menu/MenuItem.svelte";
  import MenuLabel from "../Menu/MenuLabel.svelte";
  import MenuDivider from "../Menu/MenuDivider.svelte";
  import CustomizeIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../l10n/l10n";

  export let placement: QuickAccessPosition;

  const position = QuickAccessToolbar.position;
  const isHidden = QuickAccessToolbar.isHidden;
  const chosenIDs = QuickAccessToolbar.chosenIDs;
  const commands = QuickAccessToolbar.commands;

  let customizeEl: HTMLButtonElement;
  let isMenuOpen = false;

  $: shownCommands = QuickAccessToolbar.shown($commands, $chosenIDs.value);
</script>

<style>
  .quick-access {
    align-items: center;
    gap: 2px;
    app-region: no-drag;
  }
  .quick-access.below {
    flex-shrink: 0;
    height: 32px;
    padding: 0 8px;
  }
  .customize {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 28px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
  }
  .customize:hover {
    background-color: var(--lo-hover-bg);
  }
  .customize.open {
    background-color: var(--lo-pressed-bg);
  }
</style>
