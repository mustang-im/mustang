<hbox flex class="contacts app">
  <vbox class="left-pane">
    <PersonsList {persons} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
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

  export let persons: Collection<Person>;

  let selectedPerson: Person;
</script>

<style>
  .left-pane {
    flex: 1 0 0;
  }
  .right-pane {
    flex: 3 0 0;
  }
</style>
