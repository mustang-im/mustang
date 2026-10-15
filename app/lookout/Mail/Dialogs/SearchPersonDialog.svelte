<Dialog title={$t`Choose Person`}
  okLabel={$t`OK`}
  okDisabled={!selected && $t`Select a person first`}
  onOK={onChoose}
  on:close>
  <vbox class="dialog-content">
    <span class="caption">{$t`Show only messages from or to:`}</span>
    <input type="search" bind:value={searchTerm} placeholder={$t`Name or email address`} />
    <vbox class="persons" role="listbox" aria-label={$t`Persons`}>
      {#each $found.contents.slice(0, 100) as person (person)}
        <button type="button" class="person" class:selected={selected == person}
          role="option" aria-selected={selected == person}
          on:click={() => selected = person}
          on:dblclick={() => onChooseAndClose(person)}>
          <span class="name">{person.name}</span>
          <span class="address">{person.emailAddresses.first?.value ?? ""}</span>
        </button>
      {:else}
        <span class="empty">{$t`We didn't find anybody in your address books.`}</span>
      {/each}
    </vbox>
  </vbox>
</Dialog>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../../logic/app";
  import { MailSearch } from "../Search/MailSearch";
  import Dialog from "./Dialog.svelte";
  import { ArrayColl, mergeColls, type Collection } from "svelte-collections";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  const dispatch = createEventDispatcher<{ close: void }>();
  let searchTerm = "";
  let selected: Person | null = null;

  $: found = findPersons(searchTerm.trim().toLowerCase());
  function findPersons(term: string): Collection<Person> {
    let addressbooks: Addressbook[] = term
      ? [...appGlobal.addressbooks.contents, ...appGlobal.searchOnlyAddressbooks.contents]
      : appGlobal.addressbooks.contents;
    return mergeColls(new ArrayColl(addressbooks.map(addressbook => addressbook.quickSearch(term))))
      .filterObservable(person => person.emailAddresses.hasItems)
      .sortBy(person => person.name?.toLowerCase() ?? "");
  }

  function onChoose() {
    MailSearch.update({ person: selected });
  }

  function onChooseAndClose(person: Person) {
    selected = person;
    onChoose();
    dispatch("close");
  }

</script>

<style>
  .dialog-content {
    gap: 8px;
  }
  input {
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
  .persons {
    height: 280px;
    padding: 4px;
    overflow-y: auto;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
  }
  .person {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    height: 30px;
    padding: 0 8px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .person:hover {
    background-color: var(--lo-hover-bg);
  }
  .person.selected {
    background-color: var(--lo-selected-bg);
  }
  .name {
    flex-shrink: 0;
  }
  .address {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--lo-fg-secondary);
    font-size: 13px;
  }
  .empty {
    padding: 16px;
    color: var(--lo-fg-secondary);
  }
</style>
