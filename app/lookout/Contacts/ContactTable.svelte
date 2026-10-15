<vbox flex class="contact-table" on:keydown={onKeyDown} bind:this={tableEl}>
  <div class="column-headers" style:grid-template-columns={columns} style:padding-inline-end="{scrollbarWidth}px">
    <hbox class="column-header">{$t`Full name`}</hbox>
    <hbox class="column-header">{$t`Job title`}</hbox>
    <hbox class="column-header">{$t`Company`}</hbox>
    <hbox class="column-header">{$t`Email`}</hbox>
    <hbox class="column-header">{$t`Phone`}</hbox>
  </div>
  {#if $contacts.hasItems}
    <FastList
      items={contacts}
      bind:selectedItem={selectedContact}
      bind:selectedItems={selectedContacts}
      on:init={onInit}
      {columns}>
      <ContactTableRow slot="row" let:item contact={item} {onContextMenu} />
    </FastList>
  {:else}
    <vbox flex class="empty">{emptyText}</vbox>
  {/if}
</vbox>

<ContactContextMenu bind:this={contextMenu} />

<script lang="ts">
  import type { Contact } from "../../logic/Abstract/Contact";
  import { ContactActions } from "./ContactActions";
  import ContactTableRow from "./ContactTableRow.svelte";
  import ContactContextMenu from "./ContactContextMenu.svelte";
  import FastList from "../../frontend/Shared/FastList.svelte";
  import type { ArrayColl, Collection } from "svelte-collections";
  import { t } from "../../l10n/l10n";

  export let contacts: Collection<Contact>;
  export let selectedContact: Contact;
  export let selectedContacts: ArrayColl<Contact>;
  export let emptyText: string;

  const columns = "minmax(180px, 1.6fr) minmax(100px, 1.5fr) minmax(100px, 1.2fr) minmax(160px, 1.6fr) minmax(120px, 1fr)";

  let contextMenu: ContactContextMenu;
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
    align-items: center;
    height: 32px;
    padding: 0 12px;
    overflow: hidden;
    white-space: nowrap;
    font-size: var(--lo-font-size-small);
    font-weight: 600;
    color: var(--lo-fg-secondary);
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
  .empty {
    align-items: center;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
  }
</style>
