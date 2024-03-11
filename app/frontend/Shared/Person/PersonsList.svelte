<vbox flex class="persons">
  <SearchField bind:searchTerm />
  <FastList items={personsFiltered} columns="auto">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <vbox class="person" slot="row" let:item={person} on:click={() => selected = person}>
      <PersonLine {person} isSelected={person == selected} {pictureSize}>
        <slot name="top-right" slot="top-right" {person} />
        <slot name="second-row" slot="second-row" {person} />
      </PersonLine>
    </vbox>
  </FastList>
</vbox>

<script lang="ts">
  import { Person } from "../../../logic/Abstract/Person";
  import {type PersonOrGroup,  selectedPerson } from "./PersonOrGroup";
  import type { Collection } from "svelte-collections";
  import PersonLine from "./PersonLine.svelte";
  import SearchField from "../SearchField.svelte";
  import FastList from "../FastList.svelte";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = $selectedPerson;
  export let pictureSize = 56;

  let searchTerm: string;
  $: personsFiltered = searchTerm
    ? persons.filter(p => p.name.toLowerCase().includes(searchTerm))
    : persons;

  $: if (selected instanceof Person) {
    $selectedPerson = selected
  };
</script>

<style>
  .persons :global(.row > *) {
    padding: 0;
  }
</style>
