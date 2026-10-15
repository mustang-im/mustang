<Dialog title={title ?? $t`Select Names: ${addressbook?.name ?? $t`All address books`}`} on:close={onCancel} width="800px" height="620px">
  <grid class="search-grid">
    <hbox class="search-label">
      <label for="select-names-search" class="label">{$t`Search:`}</label>
      <label class="radio">
        <input type="radio" bind:group={nameOnly} value={false} />
        {$t`All columns`}
      </label>
      <label class="radio">
        <input type="radio" bind:group={nameOnly} value={true} />
        {$t`Name only`}
      </label>
    </hbox>
    <label for="select-names-addressbook" class="label">{$t`Address Book:`}</label>
    <hbox class="search">
      <input id="select-names-search" class="lo-text-field" type="text" bind:value={typedTerm} autofocus
        on:input={onTyped} on:keydown={onSearchKey} />
      <button type="button" class="icon-button" title={$t`Go`} aria-label={$t`Go`} on:click={onGo}>
        <GoIcon size={14} />
      </button>
      <button type="button" class="icon-button" title={$t`Clear`} aria-label={$t`Clear`}
        disabled={!typedTerm} on:click={onClear}>
        <ClearIcon size={14} />
      </button>
    </hbox>
    <select id="select-names-addressbook" class="lo-text-field" bind:value={addressbook}>
      <option value={null}>{$t`All address books`}</option>
      {#each $addressbooks.each as book}
        <option value={book}>{book.name}</option>
      {/each}
      {#each $searchOnlyAddressbooks.each as book}
        <option value={book}>{book.name}</option>
      {/each}
    </select>
  </grid>
  <vbox flex class="list">
    <FastList items={persons} bind:selectedItems columns="minmax(150px, 1.4fr) minmax(90px, 1fr) minmax(110px, 1fr) minmax(90px, 1fr) minmax(90px, 1fr) minmax(170px, 1.5fr)">
      <svelte:fragment slot="header">
        <hbox class="column-header">{$t`Name`}</hbox>
        <hbox class="column-header">{$t`Title`}</hbox>
        <hbox class="column-header">{$t`Business Phone`}</hbox>
        <hbox class="column-header">{$t`Department`}</hbox>
        <hbox class="column-header">{$t`Company`}</hbox>
        <hbox class="column-header">{$t`E-mail Address`}</hbox>
      </svelte:fragment>
      <svelte:fragment slot="row" let:item={person}>
        <hbox class="cell name" on:dblclick={() => onAdd(defaultField)}>
          <UserIcon size={14} />
          <span>{person.name ?? ""}</span>
        </hbox>
        <hbox class="cell" on:dblclick={() => onAdd(defaultField)}><span>{person.position ?? ""}</span></hbox>
        <hbox class="cell" on:dblclick={() => onAdd(defaultField)}><span>{SelectNames.businessPhone(person)}</span></hbox>
        <hbox class="cell" on:dblclick={() => onAdd(defaultField)}><span>{person.department ?? ""}</span></hbox>
        <hbox class="cell" on:dblclick={() => onAdd(defaultField)}><span>{person.company ?? ""}</span></hbox>
        <hbox class="cell" on:dblclick={() => onAdd(defaultField)}>
          <span>{SelectNames.preferredEMail(person)?.value ?? ""}</span>
        </hbox>
      </svelte:fragment>
    </FastList>
    {#if $persons.isEmpty}
      <hbox class="empty lo-secondary">
        {#if searchTerm}
          {$t`No matching names`}
        {:else if isSearchOnly}
          {$t`Type a name and select Go to search this address book`}
        {:else}
          {$t`This address book has no names with an email address`}
        {/if}
      </hbox>
    {/if}
  </vbox>
  <grid class="picks">
    {#each fields as field}
      <DialogButton label={field.label + " ->"} onClick={() => onAdd(field)}
        disabled={$selectedItems.isEmpty && $t`Select a name first`} />
      <SelectedNames picks={field.picks} onRemove={recipient => onRemove(field, recipient)} />
    {/each}
  </grid>
  <svelte:fragment slot="footer">
    <DialogButton label={$t`OK`} primary onClick={onOK} />
    <DialogButton label={$t`Cancel`} onClick={onCancel} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import type { PersonUID } from "../../../logic/Abstract/PersonUID";
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../../logic/app";
  import { SelectNames, SelectNamesField } from "./SelectNames";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import SelectedNames from "./SelectedNames.svelte";
  import FastList from "../../../frontend/Shared/FastList.svelte";
  import UserIcon from "lucide-svelte/icons/user-round";
  import GoIcon from "lucide-svelte/icons/arrow-right";
  import ClearIcon from "lucide-svelte/icons/x";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let fields: SelectNamesField[];
  export let defaultField: SelectNamesField = fields[0];
  export let title: string = null;
  export let onOK: () => void;
  export let onCancel: () => void;

  let addressbooks = appGlobal.addressbooks;
  let searchOnlyAddressbooks = appGlobal.searchOnlyAddressbooks;
  let addressbook: Addressbook = null;
  let nameOnly = false;
  let typedTerm = "";
  let searchTerm = "";
  let selectedItems = new ArrayColl<Person>();
  $: isSearchOnly = !!addressbook && $searchOnlyAddressbooks.some(book => book == addressbook);
  $: searchedBooks = addressbook ? [addressbook]
    : searchTerm ? [...$addressbooks.each, ...$searchOnlyAddressbooks.each]
    : $addressbooks.contents;
  $: persons = isSearchOnly && !searchTerm
    ? new ArrayColl<Person>()
    : SelectNames.persons(searchedBooks, searchTerm, nameOnly);

  function onTyped() {
    if (nameOnly) {
      searchTerm = typedTerm;
    }
  }

  function onGo() {
    searchTerm = typedTerm;
  }

  function onClear() {
    typedTerm = "";
    searchTerm = "";
  }

  function onSearchKey(event: KeyboardEvent) {
    if (event.key == "Enter") {
      event.preventDefault();
      onGo();
    }
  }

  function onAdd(field: SelectNamesField) {
    field.add(selectedItems);
    fields = fields;
  }

  function onRemove(field: SelectNamesField, recipient: PersonUID) {
    field.remove(recipient);
    fields = fields;
  }
</script>

<style>
  .search-grid {
    grid-template-columns: 1fr 280px;
    align-items: center;
    gap: 4px 24px;
    margin-block-end: 12px;
  }
  .search-label {
    align-items: center;
    gap: 12px;
  }
  .label {
    font-weight: 600;
  }
  .radio {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .search {
    align-items: center;
    gap: 4px;
  }
  .search input {
    flex: 1 1 auto;
    min-width: 0;
  }
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
  }
  .icon-button:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
  }
  .icon-button:disabled {
    color: var(--lo-fg-disabled);
  }
  .list {
    position: relative;
    min-height: 160px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    overflow-x: auto;
  }
  .list :global(.fast-list .header > *) {
    padding: 4px 8px;
    border-block-end: 1px solid var(--lo-divider);
    border-inline-end: 1px solid var(--lo-divider);
    background-color: var(--lo-pane-alt-bg);
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    position: sticky;
    top: 0;
  }
  .cell {
    align-items: center;
    gap: 6px;
    height: 24px;
    padding: 0 8px !important;
    white-space: nowrap;
    overflow: hidden;
    cursor: default;
  }
  .cell.name :global(svg) {
    flex-shrink: 0;
    color: var(--lo-fg-secondary);
  }
  .cell span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty {
    position: absolute;
    inset: 40px 0 auto 0;
    justify-content: center;
  }
  .picks {
    grid-template-columns: 96px 1fr;
    align-items: center;
    gap: 8px 8px;
    margin-block-start: 12px;
  }
  .picks > :global(button) {
    width: 96px;
  }
</style>
