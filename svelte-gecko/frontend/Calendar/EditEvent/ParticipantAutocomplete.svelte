<hbox class="participant-autocomplete">
  <Autocomplete
    search={search}
    bind:value
    showMenuWithNoInput={false}
    >
    <hbox slot="loading">Loading...</hbox>
    <svelte:fragment slot="match" let:match={participant}>
      <ParticipantDisplay {participant} />
    </svelte:fragment>
  </Autocomplete>
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import { appGlobal } from "../../../logic/app";
  import ParticipantDisplay from "./ParticipantDisplay.svelte";
  import Autocomplete from '@smui-extra/autocomplete';

  let inputE: HTMLInputElement;
  let value: Person;

  $: console.log("new value", value);

  export async function search(inputStr: string): Promise<Person[]> {
    try {
      if (inputStr.length < 2) {
        return [];
      }
      let results = appGlobal.persons.filter(person => person.name.includes(inputStr));
      console.log("Got", results.length, "results for", inputStr);
      return results.contents;
    } catch (ex) {
      inputE.setCustomValidity(ex.message);
    }
  }
</script>

<style>
.participant-autocomplete :global(input) {
  border-top: none;
  border-left: none;
  border-right: none;
  width: 100%;
}

.participant-autocomplete :global(.mdc-deprecated-list-item--activated) {
  border: 1px solid red;
  background-color: green;
}

.participant-autocomplete :global(div) {
  width: 100%;
}
.participant-autocomplete :global(ul) {
  display: flex;
  flex-direction: column;
}
.participant-autocomplete :global(ul li) {
  display: flex;
}
</style>
