<hbox class="person">
  <PersonAutocompleteResult {person}>
    <slot name="bottom-row" slot="bottom-row" />
  </PersonAutocompleteResult>
</hbox>

<script lang="ts">
  import type { Person } from "../../../logic/Abstract/Person";
  import PersonAutocompleteResult from "./PersonAutocompleteResult.svelte";

  export let person: Person;
</script>

<style>
  .person {
    display: inline-flex;
    border: 1px solid lightgray;
    border-radius: 1000px;
    align-items: center;
    justify-content: center;
    padding-right: 12px;
    margin-right: 4px;
  }
</style>
