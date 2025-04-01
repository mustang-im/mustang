<vbox flex class="persons" {size}>
  <SearchField bind:searchTerm placeholder={$t`Search for a person or group`} />
  <FastList items={personsFiltered} columns="auto">
    <vbox class="person" slot="row" let:item={person} on:click={() => selected = person}>
      <PersonLine {person} isSelected={person == selected} {pictureSize} {size}>
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
  import type { Collection } from "svelte-collections";
  import PersonLine from "./PersonLine.svelte";
  import SearchField from "../../Shared/SearchField.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import { t } from "../../../l10n/l10n";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = $selectedPerson;
  export let size: "large" | "small" = "large";
  export let pictureSize = size == "large" ? 56 : 20;

  let searchTerm: string;
  $: personsFiltered = searchTerm
    ? persons.filter(p => p.name?.toLowerCase().includes(searchTerm))
    : persons;

  $: if (selected instanceof Person) setSelectedPerson(selected);
  function setSelectedPerson(person: Person) {
    $selectedPerson = person;
  }
</script>

<style>
  .persons :global(.row > *) {
    padding: 0;
  }
  .persons :global(.search) {
    margin: 0px 12px 8px 12px;
  }
</style>
