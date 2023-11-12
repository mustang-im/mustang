<vbox flex class="persons">
  <Scroll>
    {#each persons.each as person}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vbox class="person" class:selected={person == selected} on:click={() => selected = person}>
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
  .person {
    border-right: 1px dotted lightgray;
  }
  .person.selected {
    background-color: #20AE9E;
    color: white;
    box-shadow: 1px 1px 5px 0px rgba(0, 0, 0, 15%);
  }
</style>
