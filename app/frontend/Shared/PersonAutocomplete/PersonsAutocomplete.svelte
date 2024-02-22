<hbox flex class="persons-autocomplete">
  {#each $persons.each as person}
    <PersonEntry {person}>
      <slot name="display-bottom-row" slot="bottom-row" {person} />
    </PersonEntry>
  {/each}
  <hbox class="input">
    <PersonAutocomplete
      on:personSelected={(event) => onAddPerson(event.detail.person)}
      skipPersons={$persons}
      {placeholder}
      >
      <slot name="result-bottom-row" slot="result-bottom-row" let:person {person} />
    </PersonAutocomplete>
  </hbox>
</hbox>

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

  function onAddPerson(person: Person) {
    if (!person || persons.contains(person)) {
      return;
    }
    persons.add(person);
    console.log("added " + person, person);
  }
</script>

<style>
  .persons-autocomplete {
    flex-wrap: wrap;
    border-bottom: 1px solid lightgray;
    align-items: center;
    background-color: white;
    padding: 2px 4px;
  }
  .input {
    margin-left: 8px;
  }
  .persons-autocomplete :global(input) {
    border: none;
  }
</style>
