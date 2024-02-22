<hbox class="person" class:no-pic={!person?.picture}>
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
    background-color: #F4FFF4;
    border: 1px solid #BBFFBB;
    border-radius: 1000px;
    align-items: center;
    justify-content: center;
    padding-right: 12px;
    margin: 2px 3px;
  }
  .person :global(.top-row) {
    padding-top: 2px;
    height: 14px;
  }
  .person :global(.bottom-row) {
    padding-top: 1px;
    height: 15px;
  }
  .no-pic {
    padding-left: 14px;
  }
  .no-pic :global(.avatar) {
    display: none;
  }
</style>
