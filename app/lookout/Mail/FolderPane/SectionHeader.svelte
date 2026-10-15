<CollapsibleHeader {label} {tooltip} {collapsed} large={!!account}
  onToggle={() => MailView.setSectionCollapsed(id, !collapsed)}
  on:contextmenu={onContextMenu}>
  {#if account && $account.fatalError}
    <span class="error" title={$account.fatalError.message}>
      <ErrorIcon size={14} />
    </span>
  {/if}
</CollapsibleHeader>
{#if account}
  <ContextMenu bind:this={contextMenu}>
    <AccountContextMenu {account} />
  </ContextMenu>
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { MailView } from "../MailView";
  import AccountContextMenu from "./AccountContextMenu.svelte";
  import CollapsibleHeader from "../../Shared/CollapsibleHeader.svelte";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import ErrorIcon from "lucide-svelte/icons/circle-alert";

  export let id: string;
  export let label: string;
  export let tooltip: string = null;
  export let account: MailAccount = null;

  const collapsedIDs = MailView.collapsedSections;
  $: collapsed = $collapsedIDs && MailView.isSectionCollapsed(id);

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
  .error {
    display: flex;
    flex-shrink: 0;
    color: var(--lo-danger);
  }
</style>
