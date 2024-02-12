<hbox flex class="person-autocomplete" bind:this={topEl}>
  <Autocomplete
    onChange={onAddPerson}
    searchFunction={search}
    delay={100}
    minCharactersToSearch={2}
    localFiltering={false}
    localSorting={false}
    closeOnBlur={true}
    hideArrow={true}
    noResultsText="No person found"
    {placeholder}
    >
    <hbox slot="loading">Loading...</hbox>
    <svelte:fragment slot="item" let:item={person}>
      <PersonAutocompleteResult {person}>
        <slot name="result-bottom-row" slot="bottom-row" {person} />
      </PersonAutocompleteResult>
    </svelte:fragment>
  </Autocomplete>
</hbox>

<script lang="ts">
  import { ArrayColl, type Collection } from "svelte-collections";
  import type { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import PersonAutocompleteResult from "./PersonAutocompleteResult.svelte";
  // <https://github.com/pstanoev/simple-svelte-autocomplete>
  // <http://simple-svelte-autocomplete.surge.sh>
  import Autocomplete from 'simple-svelte-autocomplete';
	import { createEventDispatcher, tick } from 'svelte';
	const dispatchEvent = createEventDispatcher();

  export let skipPersons: Collection<Person> = new ArrayColl<Person>();
  export let placeholder = "Add person";

  export async function search(inputStr: string): Promise<Person[]> {
    try {
      if (inputStr.length < 2) {
        return [];
      }
      let results = appGlobal.persons
        .filter(person => person.name.includes(inputStr) &&
          !skipPersons.contains(person));
      console.log("Got", results.length, "results for", inputStr);
      return results.contents;
    } catch (ex) {
      console.error(ex);
      alert(ex.message);
      //inputE.setCustomValidity(ex.message ?? ex + "");
      //inputE.reportValidity();
    }
  }

  let topEl: HTMLDivElement;
  async function onAddPerson(person: Person) {
    dispatchEvent('personSelected', { person });

    // Clear, to allow user to enter the next person
    await tick();
    // Hack, because component doesn't allow me to clear the text field value
    if (topEl) {
      topEl.querySelector("input").value = "";
    }
  }
</script>

<style>
.person-autocomplete {
  height: 2em;
}

.person-autocomplete :global(.autocomplete) {
  height: 100% !important;
  width: 100%;
}
.person-autocomplete :global(.input-container) {
  height: 100%;
}
.person-autocomplete :global(input) {
  padding: 0px !important;
}

.person-autocomplete :global(.mdc-deprecated-list-item--activated) {
  border: 1px solid red;
  background-color: green;
}
</style>
