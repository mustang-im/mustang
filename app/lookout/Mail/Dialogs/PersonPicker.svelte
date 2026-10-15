<vbox class="person-picker">
  <input class="lo-text-field" type="search" bind:value={searchTerm} placeholder={$t`Name or email address`} aria-label={label} />
  <vbox class="persons" role="listbox" aria-label={label} style:height={height}>
    {#each $found.contents.slice(0, 100) as person (person)}
      <button type="button" class="person" class:selected={selected == person}
        role="option" aria-selected={selected == person}
        on:click={() => selected = person}
        on:dblclick={() => onChoose(person)}>
        <span class="name">{person.name}</span>
        <span class="address">{person.emailAddresses.first?.value ?? ""}</span>
      </button>
    {:else}
      <span class="empty">{$t`We didn't find anybody in your address books.`}</span>
    {/each}
  </vbox>
</vbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import type { Addressbook } from "../../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../../logic/app";
  import { SelectNames } from "../Composer/SelectNames";
  import type { Collection } from "svelte-collections";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let label: string;
  export let selected: Person | null = null;
  export let height = "280px";

  const dispatch = createEventDispatcher<{ choose: Person }>();
  let searchTerm = "";

  $: found = findPersons(searchTerm);
  function findPersons(term: string): Collection<Person> {
    let addressbooks: Addressbook[] = term.trim()
      ? [...appGlobal.addressbooks.contents, ...appGlobal.searchOnlyAddressbooks.contents]
      : appGlobal.addressbooks.contents;
    return SelectNames.persons(addressbooks, term);
  }

  function onChoose(person: Person) {
    selected = person;
    dispatch("choose", person);
  }
</script>

<style>
  .person-picker {
    gap: 8px;
  }
  .persons {
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
