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
  import type { PersonOrGroup } from "./PersonOrGroup";
  import type { Collection } from "svelte-collections";
  import PersonLine from "./PersonLine.svelte";
  import Scroll from "../Scroll.svelte";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = null;
</script>

<style>
</style>
