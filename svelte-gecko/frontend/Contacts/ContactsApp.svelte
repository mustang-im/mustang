<hbox class="contacts app">
  <vbox class="left-pane">
    <PersonsList {persons} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
    <PersonDetails person={selectedPerson} />
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Person/Person";
  import PersonsList from "../Chat/PersonsList.svelte";
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
