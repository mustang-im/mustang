<vbox flex class="persons">
  <Scroll>
    {#each $persons.each as person}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vbox class="person" on:click={() => selected = person}>
        <PersonLine {person} isSelected={person == selected}>
          <slot name="top-right" slot="top-right" {person} />
          <slot name="second-row" slot="second-row" {person} />
        </PersonLine>
      </vbox>
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import {type PersonOrGroup,  selectedPerson } from "./PersonOrGroup";
  import type { Collection } from "svelte-collections";
  import PersonLine from "./PersonLine.svelte";
  import Scroll from "../Scroll.svelte";
  import { Person } from "../../../logic/Abstract/Person";

  export let persons: Collection<PersonOrGroup>;
  export let selected: PersonOrGroup = $selectedPerson;
  $: if (selected instanceof Person) {
    $selectedPerson = selected
  };
</script>

<style>
</style>
