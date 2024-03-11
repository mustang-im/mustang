<vbox flex class="persons">
  <hbox class="search">
    <SearchIcon size="16px" />
    <input type="search" bind:value={searchTerm} placeholder="Search for a person or group" />
    {#if searchTerm}
      <RoundButton icon={XIcon} iconSize="16px" padding="4px" border={false}
        on:click={() => searchTerm = undefined} />
    {/if}
  </hbox>
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
  import FastList from "../FastList.svelte";
  import RoundButton from "../RoundButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import XIcon from "lucide-svelte/icons/x";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = $selectedPerson;
  export let pictureSize = 56;

  let searchTerm: string;
  $: searchTermLower = searchTerm?.toLowerCase();
  $: personsFiltered = searchTermLower
    ? persons.filter(p => p.name.toLowerCase().includes(searchTermLower))
    : persons;

  $: if (selected instanceof Person) {
    $selectedPerson = selected
  };
</script>

<style>
  .persons :global(.row > *) {
    padding: 0;
  }

  .search {
    margin: 0px 12px 8px 12px;
    border: 1px solid #A1E4DA;
    padding-left: 8px;
    padding-right: 4px;
    border-radius: 100px;
    background-color: white;
    align-items: center;
  }
  .search :global(svg) {
    color: #808080;
  }
  input[type="search"] {
    width: 100%;
    height: 32px;
    border: none;
    margin-left: 4px;
    border-radius: 100px;
  }
  input::placeholder {
    color: #808080;
  }
</style>
