<Dialog title={$t`Select Names: ${addressbook?.name ?? $t`All address books`}`} on:close={onCancel} width="720px" height="600px">
  <hbox class="search-row">
    <vbox flex class="search">
      <label for="select-names-search">{$t`Search`}</label>
      <input id="select-names-search" type="search" bind:value={searchTerm} autofocus
        placeholder={$t`Name or email address`} />
    </vbox>
    <vbox class="addressbook">
      <label for="select-names-addressbook">{$t`Address Book`}</label>
      <select id="select-names-addressbook" class="lo-text-field" bind:value={addressbook}>
        <option value={null}>{$t`All address books`}</option>
        {#each $addressbooks.each as book}
          <option value={book}>{book.name}</option>
        {/each}
      </select>
    </vbox>
  </hbox>
  <vbox flex class="list">
    <FastList items={persons} bind:selectedItems columns="minmax(160px, 1fr) minmax(160px, 1.3fr)">
      <svelte:fragment slot="header">
        <hbox class="column-header">{$t`Name`}</hbox>
        <hbox class="column-header">{$t`Email Address`}</hbox>
      </svelte:fragment>
      <svelte:fragment slot="row" let:item={person}>
        <hbox class="cell name" on:dblclick={() => onAdd(defaultField)}>
          <UserIcon size={14} />
          <span>{person.name ?? ""}</span>
        </hbox>
        <hbox class="cell email" on:dblclick={() => onAdd(defaultField)}>
          {SelectNames.preferredEMail(person)?.value ?? ""}
        </hbox>
      </svelte:fragment>
    </FastList>
    {#if $persons.isEmpty}
      <hbox class="empty lo-secondary">
        {searchTerm ? $t`No matching names` : $t`This address book has no names with an email address`}
      </hbox>
    {/if}
  </vbox>
  <grid class="picks">
    {#each fields as field}
      <DialogButton label={labels[field] + " ->"} onClick={() => onAdd(field)}
        disabled={$selectedItems.isEmpty && $t`Select a name first`} />
      <SelectedNames picks={selectNames.picks[field]} onRemove={recipient => selectNames.remove(field, recipient)} />
    {/each}
  </grid>
  <svelte:fragment slot="footer">
    <DialogButton label={$t`OK`} primary onClick={onOK} />
    <DialogButton label={$t`Cancel`} onClick={onCancel} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../../logic/app";
  import { SelectNames, RecipientField } from "./SelectNames";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import SelectedNames from "./SelectedNames.svelte";
  import FastList from "../../../frontend/Shared/FastList.svelte";
  import UserIcon from "lucide-svelte/icons/user-round";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let mail: EMail;
  export let defaultField: RecipientField = RecipientField.To;
  export let onDone: () => void;

  const fields = [RecipientField.To, RecipientField.Cc, RecipientField.Bcc];
  $: labels = {
    [RecipientField.To]: $t`To`,
    [RecipientField.Cc]: $t`Cc`,
    [RecipientField.Bcc]: $t`Bcc`,
  };

  let selectNames = new SelectNames(mail);
  let addressbooks = appGlobal.addressbooks;
  let addressbook: Addressbook = null;
  let searchTerm = "";
  let selectedItems = new ArrayColl<Person>();
  $: persons = SelectNames.persons(addressbook ? [addressbook] : $addressbooks, searchTerm);

  function onAdd(field: RecipientField) {
    selectNames.add(field, selectedItems);
    selectNames = selectNames;
  }

  function onOK() {
    selectNames.apply(mail);
    onDone();
  }

  function onCancel() {
    onDone();
  }
</script>

<style>
  .search-row {
    gap: 16px;
    align-items: end;
    margin-block-end: 12px;
  }
  label {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
    margin-block-end: 2px;
  }
  .addressbook select {
    min-width: 200px;
    height: 28px;
  }
  .list {
    position: relative;
    min-height: 160px;
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
  }
  .list :global(.fast-list .header > *) {
    padding: 4px 8px;
    border-block-end: 1px solid var(--lo-divider);
    background-color: var(--lo-pane-alt-bg);
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
    position: sticky;
    top: 0;
  }
  .cell {
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 8px !important;
    white-space: nowrap;
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
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 8px 12px;
    margin-block-start: 12px;
  }
</style>
