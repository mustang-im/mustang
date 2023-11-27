<hbox flex class="contacts app">
  <vbox flex class="left-pane">
    <PersonsToolbar {persons} bind:selected={selectedPerson} />
    <PersonsList {persons} bind:selected={selectedPerson} />
  </vbox>
  <vbox flex class="right-pane">
    {#if selectedPerson}
      <Scroll>
        <PersonDetails person={selectedPerson} />
      </Scroll>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import PersonsList from "./PersonsList.svelte";
  import PersonDetails from "./PersonDetails.svelte";
  import type { Collection } from "svelte-collections";
  import Scroll from "../Shared/Scroll.svelte";
  import PersonsToolbar from "./PersonsToolbar.svelte";

  export let persons: Collection<Person>;

  let selectedPerson: Person;
</script>

<style>
  .left-pane {
    border-right: 1px dotted lightgray;
    background-color: #f8f8fa;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on PersonDetails */
  }
  .right-pane {
    flex: 3 0 0;
  }
</style>
