<vbox flex class="contact-table" on:keydown={onKeyDown} bind:this={tableEl}>
  <div class="column-headers" style:grid-template-columns={gridColumns} style:padding-inline-end="{scrollbarWidth}px">
    {#each columns as column}
      <button class="column-header" class:sorted={$sort.value.column == column}
        title={$t`Sort by ${ContactColumns.label(column)}`}
        aria-sort={$sort.value.column == column ? ($sort.value.ascending ? "ascending" : "descending") : "none"}
        on:click={() => sortBy(column)}
        on:contextmenu={event => onHeaderContextMenu(event, column)}>
        <span class="label">{ContactColumns.label(column)}</span>
        {#if $sort.value.column == column}
          <svelte:component this={$sort.value.ascending ? AscendingIcon : DescendingIcon} size="12" />
        {/if}
      </button>
    {/each}
  </div>
  {#if canAdd}
    <button class="add-row" style:grid-template-columns={gridColumns}
      on:click={() => ContactActions.newContact($selectedAddressbook)}>
      <span class="add-label">{$t`Click here to add a new Contact`}</span>
    </button>
  {/if}
  {#if $contacts.hasItems}
    <FastList
      items={contacts}
      bind:selectedItem={selectedContact}
      bind:selectedItems={selectedContacts}
      on:init={onInit}
      columns={gridColumns}>
      <ContactTableRow slot="row" let:item contact={item} {columns} {onContextMenu} />
    </FastList>
  {:else}
    <vbox flex class="empty">{emptyText}</vbox>
  {/if}
</vbox>

<ContactContextMenu bind:this={contextMenu} />
<ContextMenu bind:this={headerMenu}>
  {#if headerColumn}
    <MenuItem label={$t`Sort Ascending`} icon={SortAscendingIcon}
      checked={$sort.value.column == headerColumn && $sort.value.ascending}
      onClick={() => { $sort.value = { column: headerColumn, ascending: true }; }} />
    <MenuItem label={$t`Sort Descending`} icon={SortDescendingIcon}
      checked={$sort.value.column == headerColumn && !$sort.value.ascending}
      onClick={() => { $sort.value = { column: headerColumn, ascending: false }; }} />
    <MenuDivider />
  {/if}
  <SubMenu label={$t`Arrange By`} icon={ArrangeIcon}>
    {#each columns as column}
      <MenuItem label={ContactColumns.label(column)} checked={$sort.value.column == column}
        onClick={() => { $sort.value = { column, ascending: true }; }} />
    {/each}
  </SubMenu>
  <MenuItem label={$t`Reverse Sort`} icon={ReverseIcon}
    onClick={() => { $sort.value = { column: $sort.value.column, ascending: !$sort.value.ascending }; }} />
</ContextMenu>

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { ContactActions } from "./ContactActions";
  import ContactTableRow from "./ContactTableRow.svelte";
  import ContactContextMenu from "./ContactContextMenu.svelte";
  import { selectedAddressbook } from "./Selected";
  import { appGlobal } from "../../logic/app";
  import ContextMenu from "../Shared/Menu/ContextMenu.svelte";
  import MenuItem from "../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../Shared/Menu/MenuDivider.svelte";
  import SubMenu from "../Shared/Menu/SubMenu.svelte";
  import SortAscendingIcon from "lucide-svelte/icons/arrow-up-a-z";
  import SortDescendingIcon from "lucide-svelte/icons/arrow-down-z-a";
  import ArrangeIcon from "lucide-svelte/icons/arrow-down-wide-narrow";
  import ReverseIcon from "lucide-svelte/icons/arrow-up-down";
  import FastList from "../../frontend/Shared/FastList.svelte";
  import { ContactColumns, type ContactColumn } from "./Views/ContactColumns";
  import AscendingIcon from "lucide-svelte/icons/chevron-up";
  import DescendingIcon from "lucide-svelte/icons/chevron-down";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let contacts: Collection<Contact>;
  export let selectedContact: Contact;
  export let selectedContacts: ArrayColl<Contact>;
  export let emptyText: string;
  export let columns: ContactColumn[];

  const sort = ContactColumns.sort;
  $: gridColumns = columns.map(column => ContactColumns.width(column)).join(" ");

  function sortBy(column: ContactColumn) {
    ContactColumns.sort.value = ContactColumns.toggledSort(ContactColumns.sort.value, column);
  }

  let contextMenu: ContactContextMenu;
  let headerMenu: ContextMenu;
  let headerColumn: ContactColumn = null;

  $: canAdd = !$selectedAddressbook || appGlobal.addressbooks.contains($selectedAddressbook);

  function onHeaderContextMenu(event: MouseEvent, column: ContactColumn) {
    event.preventDefault();
    headerColumn = column;
    headerMenu.onContextMenu(event);
  }
  let tableEl: HTMLElement;
  let scrollbarWidth = 0;

  function onInit(event: CustomEvent<{ scrollToItem: (contact: Contact) => void }>) {
    if (!contacts.contains(selectedContact)) {
      selectedContacts.clear();
      selectedContacts.add(contacts.first);
    }
    event.detail.scrollToItem(selectedContacts.first ?? selectedContact);
    let listEl = tableEl.querySelector(".fast-list") as HTMLElement;
    scrollbarWidth = listEl ? listEl.offsetWidth - listEl.clientWidth : 0;
  }

  function onContextMenu(event: MouseEvent, contact: Contact) {
    contextMenu.openFor(event, contact, selectedContacts);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key == "Enter" && selectedContact && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      ContactActions.edit(selectedContact);
    }
  }
</script>

<style>
  .contact-table {
    min-height: 0;
  }
  .column-headers {
    display: grid;
    flex-shrink: 0;
    border-block-end: 1px solid var(--lo-divider);
  }
  .column-header {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    height: 32px;
    padding: 0 12px;
    border: none;
    border-inline-end: 1px solid var(--lo-divider);
    background: none;
    overflow: hidden;
    white-space: nowrap;
    font: inherit;
    font-size: var(--lo-font-size-small);
    font-weight: 600;
    color: var(--lo-fg-secondary);
    text-align: start;
    cursor: pointer;
  }
  .column-header:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .column-header.sorted {
    color: var(--lo-fg);
  }
  .column-header .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .column-header:first-child {
    padding-inline-start: 44px;
  }
  .contact-table :global(.fast-list .header) {
    display: none;
  }
  .contact-table :global(.fast-list .row > *) {
    padding: 0;
  }
  .contact-table :global(.fast-list:focus-visible) {
    outline: none;
  }
  .contact-table :global(.fast-list:focus-visible .row.selected .cell) {
    border-block: 1px solid var(--lo-focus-ring);
  }
  .add-row {
    display: grid;
    flex-shrink: 0;
    height: 30px;
    padding: 0;
    border: none;
    border-block-end: 1px solid var(--lo-divider);
    background: none;
    font: inherit;
    text-align: start;
    cursor: text;
  }
  .add-row:hover {
    background-color: var(--lo-hover-bg);
  }
  .add-label {
    grid-column: 1 / -1;
    padding-inline-start: 44px;
    color: var(--lo-fg-secondary);
    font-style: italic;
  }
  .empty {
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
  }
</style>
