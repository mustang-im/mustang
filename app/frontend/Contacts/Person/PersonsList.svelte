<vbox flex class="persons" class:mobile={appGlobal.isMobile}>
  {#if showSearch}
    <SearchField bind:searchTerm placeholder={$t`Search for a person or group`} autofocus={doSearch} />
  {/if}
  <FastList items={sortedPersons} bind:selectedItem={selected} bind:selectedItems={selectedPersons} columns="auto">
    <vbox class="person" slot="row" let:item={person}>
      <PersonLine {person} isSelected={person == selected} {pictureSize} on:click>
        <slot name="top-right" slot="top-right" {person} />
        <slot name="second-row" slot="second-row" {person} />
      </PersonLine>
    </vbox>
  </FastList>
</vbox>

<script lang="ts">
  import { Person } from "../../../logic/Abstract/Person";
  import type { PersonOrGroup } from "./PersonOrGroup";
  import { selectedPerson } from "./Selected";
  import { appGlobal } from "../../../logic/app";
  import { ArrayColl, type Collection } from "svelte-collections";
  import PersonLine from "./PersonLine.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import { t } from "../../../l10n/l10n";
  import { mergeColls } from "svelte-collections";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = $selectedPerson;
  export let selectedPersons: ArrayColl<PersonOrGroup>;
  export let pictureSize = appGlobal.isMobile ? 32 : 20;
  /** in/out */
  export let searchTerm: string | null = null;
  /* Show or entirely remove the search field -- in */
  export let showSearch = true;
  /** focus the search field when this component loads -- in */
  export let doSearch = false;
  export let sortBy = (person: PersonOrGroup) => person.name.toLowerCase();

  let searchAddressbooks = appGlobal.addressbooks.merge(appGlobal.searchOnlyAddressbooks);
  $: filteredPersons = searchTerm
    ? mergeColls(searchAddressbooks.map(ab => ab.quickSearch(searchTerm, true)))
    : persons;
  $: sortedPersons = filteredPersons.sortBy(sortBy);

  $: searchTerm && adaptSelected();
  function adaptSelected() {
    if (!sortedPersons.contains(selected)) {
      selected = sortedPersons.first;
    }
  }

  $: selected && setSelectedPerson();
  function setSelectedPerson() {
    if (selected instanceof Person) {
      $selectedPerson = selected;
    }
  }
</script>

<style>
  .persons :global(.row > *) {
    padding: 0;
  }
  .persons :global(.search) {
    margin: 0px 12px 8px 12px;
  }
  .persons.mobile :global(.search) {
    order: 1;
    margin-block-start: 8px;
  }
  /** Overridden in Meet/Participantsbar/Sidebar.svelte */
  .persons :global(.row.odd:not(.selected):not(:hover) hbox.person) {
    background-color: var(--main-bg);
    color: var(--fg);
  }
</style>
