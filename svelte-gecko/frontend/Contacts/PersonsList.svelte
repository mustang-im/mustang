<vbox class="persons">
  <Scroll>
    {#each persons.each as person}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vbox on:click={() => selected = person}>
        <PersonLine {person} />
      </vbox>
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Person } from "../../logic/Abstract/Person";
  import PersonLine from "./PersonLine.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let persons: Collection<Person>;
  export let selected: Person = null;
</script>

<style>
  .persons {
    flex: 1 0 0;
    border-right: 1px solid grey;
  }
</style>
