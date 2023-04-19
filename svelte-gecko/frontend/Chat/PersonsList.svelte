<vbox class="persons">
  {#each persons.each as person}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <vbox on:click={() => selected = person}>
      <PersonLine {person} />
    </vbox>
  {/each}
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Person } from "../../logic/Person/Person";
  import PersonLine from "./PersonLine.svelte";

  export let persons: Collection<Person>;
  export let selected: Person = null;
</script>

<style>
  .persons {
    flex: 1 0 0;
  }
</style>
