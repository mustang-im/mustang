<hbox class="person-autocomplete">
  <Autocomplete
    {search}
    bind:value={person}
    {placeholder}
    showMenuWithNoInput={false}
    noMatchesActionDisabled={true}
    >
    <hbox slot="loading">Loading...</hbox>
    <svelte:fragment slot="match" let:match={person}>
      <PersonAutocompleteResult {person}>
        <slot name="result-bottom-row" slot="bottom-row" {person} />
      </PersonAutocompleteResult>
    </svelte:fragment>
  </Autocomplete>
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import PersonAutocompleteResult from "./PersonAutocompleteResult.svelte";
  import Autocomplete from '@smui-extra/autocomplete';

  /**
   * out
   * The person that the user selected.
   * null, if nothing selected. */
  export let person: Person;
  export let placeholder = "Add person";

  export async function search(inputStr: string): Promise<Person[]> {
    try {
      if (inputStr.length < 2) {
        return [];
      }
      let results = appGlobal.persons.filter(person => person.name.includes(inputStr));
      console.log("Got", results.length, "results for", inputStr);
      return results.contents;
    } catch (ex) {
      console.error(ex);
      alert(ex.message);
      //inputE.setCustomValidity(ex.message ?? ex + "");
      //inputE.reportValidity();
    }
  }
</script>

<style>
.person-autocomplete :global(input) {
  border-top: none;
  border-left: none;
  border-right: none;
  width: 100%;
}

.person-autocomplete :global(.mdc-deprecated-list-item--activated) {
  border: 1px solid red;
  background-color: green;
}

.person-autocomplete :global(div) {
  width: 100%;
}
.person-autocomplete :global(ul) {
  display: flex;
  flex-direction: column;
}
.person-autocomplete :global(ul li) {
  display: flex;
}
</style>
