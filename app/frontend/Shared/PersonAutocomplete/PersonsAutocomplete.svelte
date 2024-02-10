<div class="persons-autocomplete">
  {#each $persons.each as person}
    <PersonEntry {person}>
      <slot name="display-bottom-row" slot="bottom-row" {person} />
    </PersonEntry>
  {/each}
  <PersonAutocomplete bind:person={personToAdd} {placeholder}>
    <slot name="result-bottom-row" slot="bottom-row" person={personToAdd} />
  </PersonAutocomplete>
</div>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonAutocomplete from "./PersonAutocomplete.svelte";
  import PersonEntry from "./PersonEntry.svelte";

  /**
   * The persons that the user selected.
   * in/out */
  export let persons: Collection<Person>;
  export let placeholder: string = null;

  let personToAdd: Person;
  $: personToAdd && onAddPerson(personToAdd);
  function onAddPerson(person: Person) {
    if (!person || persons.contains(person)) {
      return;
    }
    persons.add(person);
    personToAdd = null;
    console.log("added " + person, person);
  }
</script>

<style>
  .persons-autocomplete {
    flex-wrap: wrap;
    border-bottom: 1px solid green;
  }
  .persons-autocomplete :global(input) {
    border: none;
  }
</style>
