<button class="addressbook-item"
  class:selected={isSelected}
  class:indented
  on:click={onSelect}
  on:contextmenu={onContextMenu}
  title={addressbook?.name ?? label}
  aria-current={isSelected}>
  <svelte:component this={icon} size={16} class="icon" />
  <span class="name">{addressbook ? $addressbook.name : label}</span>
  {#if shownCount}
    <span class="count">{shownCount}</span>
  {/if}
</button>

{#if addressbook}
  <ContextMenu bind:this={contextMenu}>
    {#if isWritable}
      <MenuItem
        label={$t`New Contact`}
        icon={NewContactIcon}
        onClick={() => ContactActions.newContact(addressbook)} />
      <MenuItem
        label={$t`New Contact Group`}
        icon={NewGroupIcon}
        onClick={() => ContactActions.newGroup(addressbook)} />
      <MenuDivider />
    {/if}
    {#if addressbook.canSync}
      <MenuItem
        label={$t`Update Folder`}
        icon={SyncIcon}
        onClick={() => ContactActions.sync(addressbook)} />
    {/if}
    {#if isWritable}
      <MenuItem
        label={$t`Import / Export…`}
        icon={ImportIcon}
        onClick={() => openSettingsCategoryForAccount(addressbook, "contacts-import")} />
    {/if}
    <MenuItem
      label={$t`Properties`}
      icon={PropertiesIcon}
      onClick={() => openSettingsCategoryForAccount(addressbook)} />
  </ContextMenu>
{/if}

<script lang="ts">
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { ContactActions } from "./ContactActions";
  import { appGlobal } from "../../logic/app";
  import { openSettingsCategoryForAccount } from "../../frontend/Settings/Window/CategoriesUtils";
  import ContextMenu from "../../frontend/Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../frontend/Shared/Menu/MenuDivider.svelte";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import NewContactIcon from "lucide-svelte/icons/user-round-plus";
  import NewGroupIcon from "lucide-svelte/icons/users-round";
  import SyncIcon from "lucide-svelte/icons/refresh-cw";
  import ImportIcon from "lucide-svelte/icons/file-input";
  import PropertiesIcon from "lucide-svelte/icons/settings-2";
  import { t } from "../../l10n/l10n";

  export let addressbook: Addressbook = null;
  export let label: string = null;
  export let icon: ConstructorOfATypedSvelteComponent = AddressbookIcon;
  export let count: number = null;
  export let isSelected = false;
  export let indented = true;
  export let onSelect: () => void;

  let contextMenu: ContextMenu;

  $: contacts = addressbook?.contacts;
  $: shownCount = count ?? $contacts?.length;
  $: isWritable = addressbook && appGlobal.addressbooks.contains(addressbook);

  function onContextMenu(event: MouseEvent) {
    if (!addressbook) {
      return;
    }
    event.preventDefault();
    contextMenu.onContextMenu(event);
  }
</script>

<style>
  .addressbook-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    position: relative;
    min-height: 32px;
    padding: 4px 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .addressbook-item.indented {
    padding-inline-start: 28px;
  }
  .addressbook-item:hover {
    background-color: var(--lo-hover-bg);
  }
  .addressbook-item.selected {
    background-color: var(--lo-selected-bg);
    font-weight: 600;
  }
  .addressbook-item.selected:hover {
    background-color: var(--lo-selected-hover-bg);
  }
  .addressbook-item.selected::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .addressbook-item :global(.icon) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
  }
  .addressbook-item.selected :global(.icon) {
    color: var(--lo-accent-text);
  }
  .name {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .count {
    flex-shrink: 0;
    font-size: var(--lo-font-size-small);
    font-weight: normal;
    color: var(--lo-fg-secondary);
  }
</style>
