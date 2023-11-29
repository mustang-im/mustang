<vbox flex class="persons">
  <Scroll>
    {#each persons.each as person}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vbox class="person" on:click={() => selected = person}>
        <PersonLine {person} selected={person == selected}/>
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
</style>
