<hbox class="contacts app">
  <vbox class="left-pane">
    <PersonsList {persons} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
    {#if selectedPerson}
      <PersonDetails person={selectedPerson} />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import PersonsList from "./PersonsList.svelte";
  import PersonDetails from "./PersonDetails.svelte";
  import type { Collection } from "svelte-collections";

  export let persons: Collection<Person>;

  let selectedPerson: Person;
</script>

<style>
  .app {
    flex: 1 0 0;
  }
  .left-pane {
    flex: 1 0 0;
  }
  .right-pane {
    flex: 2 0 0;
  }
</style>
