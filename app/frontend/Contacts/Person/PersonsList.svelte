<vbox flex class="persons" {size} class:mobile={appGlobal.isMobile}>
  {#if showSearch}
    <SearchField bind:searchTerm placeholder={$t`Search for a person or group`} autofocus={doSearch} />
  {/if}
  <FastList items={filteredPersons} columns="auto">
    <vbox class="person" slot="row" let:item={person} on:click={() => selected = person}>
      <PersonLine {person} isSelected={person == selected} {pictureSize} {size} on:click>
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
  import type { Collection } from "svelte-collections";
  import PersonLine from "./PersonLine.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import { t } from "../../../l10n/l10n";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = $selectedPerson;
  export let size: "large" | "small" = "large";
  export let pictureSize = size == "large" ? 56 : appGlobal.isMobile ? 32 : 20;
  /** in/out */
  export let searchTerm: string | null = null;
  /* Show or entirely remove the search field -- in */
  export let showSearch = true;
  /** focus the search field when this component loads -- in */
  export let doSearch = false;

  $: filteredPersons = searchTerm
    ? persons.filter(p =>
      p.name?.toLowerCase().includes(searchTerm) ||
      p instanceof Person && (
        p.emailAddresses.some(e => e.value.toLowerCase().includes(searchTerm)) ||
        p.phoneNumbers.some(e => e.value.toLowerCase().includes(searchTerm)) ||
        p.chatAccounts.some(e => e.value.toLowerCase().includes(searchTerm)) ||
        p.streetAddresses.some(e => e.value.toLowerCase().includes(searchTerm)) ||
        p.notes?.toLowerCase().includes(searchTerm))
    )
    : persons;

  $: searchTerm && adaptSelected();
  function adaptSelected() {
    if (!filteredPersons.contains(selected)) {
      selected = filteredPersons.first;
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
  }
</style>
