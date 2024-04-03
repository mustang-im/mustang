<Splitter name="persons-list" initialRightRatio={4}>
  <vbox flex class="left-pane" slot="left">
    <PersonsToolbar {persons} />
    <PersonsList persons={filteredPersons} bind:selected={$selectedPerson} />
  </vbox>
  <vbox flex class="right-pane" slot="right">
    {#if $selectedPerson}
      <Scroll>
        <PersonDetails person={$selectedPerson} />
      </Scroll>
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "../Shared/Person/PersonOrGroup";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import PersonsList from "../Shared/Person/PersonsList.svelte";
  import PersonDetails from "./PersonDetails.svelte";
  import PersonsToolbar from "./PersonsToolbar.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import type { Collection } from "svelte-collections";

  let persons = appGlobal.persons;

  $: filteredPersons = $globalSearchTerm
    ? persons.filter(p =>
      p.name.toLowerCase().includes($globalSearchTerm) ||
      p.emailAddresses.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.phoneNumbers.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.chatAccounts.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.streetAddresses.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.notes.toLowerCase().includes($globalSearchTerm))
    : persons;
  $: clearSelected(filteredPersons);
  function clearSelected(filteredPersons: Collection<Person>) {
    if (!filteredPersons.contains($selectedPerson)) {
      $selectedPerson = filteredPersons.first;
    }
  }
</script>

<style>
  .left-pane {
    border-right: 1px dotted lightgray;
    background-color: #F9F9FD;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on PersonDetails */
  }
</style>
