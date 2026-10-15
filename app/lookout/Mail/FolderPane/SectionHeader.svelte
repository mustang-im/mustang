<button class="section-header"
  class:account={!!account}
  on:click={onToggle}
  on:contextmenu={onContextMenu}
  aria-expanded={!collapsed}
  title={tooltip ?? label}>
  <ChevronIcon size={14} class="chevron {collapsed ? 'collapsed' : ''}" />
  <span class="label">{label}</span>
  {#if account && $account.fatalError}
    <span class="error" title={$account.fatalError.message}>
      <ErrorIcon size={14} />
    </span>
  {/if}
</button>
{#if account}
  <ContextMenu bind:this={contextMenu}>
    <AccountContextMenu {account} />
  </ContextMenu>
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { MailView } from "../MailView";
  import AccountContextMenu from "./AccountContextMenu.svelte";
  import ContextMenu from "../../../frontend/Shared/Menu/ContextMenu.svelte";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import ErrorIcon from "lucide-svelte/icons/circle-alert";

  export let id: string;
  export let label: string;
  export let tooltip: string = null;
  export let account: MailAccount = null;

  const collapsedIDs = MailView.collapsedSections;
  $: collapsed = $collapsedIDs && MailView.isSectionCollapsed(id);

  function onToggle() {
    MailView.setSectionCollapsed(id, !collapsed);
  }

  let contextMenu: ContextMenu;
  function onContextMenu(event: MouseEvent) {
    if (!contextMenu) {
      return;
    }
    event.preventDefault();
    contextMenu.onContextMenu(event);
  }
</script>

<style>
  .section-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 6px;
    margin-block-start: 8px;
    padding: 4px 8px 4px 4px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
  }
  .section-header.account {
    margin-block-start: 12px;
    font-size: 15px;
  }
  .section-header:hover {
    background-color: var(--lo-hover-bg);
  }
  .section-header :global(.chevron) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
    transition: transform 0.1s;
  }
  .section-header :global(.chevron.collapsed) {
    transform: rotate(-90deg);
  }
  .label {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .error {
    display: flex;
    flex-shrink: 0;
    color: var(--lo-danger);
  }
</style>
