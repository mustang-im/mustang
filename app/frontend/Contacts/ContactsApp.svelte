<Splitter name="persons-list" initialRightRatio={4}>
  <vbox flex class="left-pane" slot="left">
    <PersonsToolbar {persons} bind:selectedAddressbook />
    <PersonsList persons={filteredPersons} bind:selected={$selectedPerson} size="small" />
  </vbox>
  <vbox flex class="right-pane" slot="right">
    {#if $selectedPerson && $selectedPerson instanceof Person}
      <Scroll>
        <PersonDetails person={$selectedPerson} />
      </Scroll>
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { selectedPerson } from "./Person/Selected";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import PersonsList from "./Person/PersonsList.svelte";
  import PersonDetails from "./PersonDetails.svelte";
  import PersonsToolbar from "./PersonsToolbar.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import type { Collection } from "svelte-collections";

  let selectedAddressbook = $selectedPerson?.addressbook ?? appGlobal.addressbooks.first;

  $: persons = (selectedAddressbook?.persons ?? appGlobal.persons) as Collection<Person>;
  $: filteredPersons = $globalSearchTerm
    ? persons.filter(p =>
      p.name?.toLowerCase().includes($globalSearchTerm) ||
      p.emailAddresses.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.phoneNumbers.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.chatAccounts.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.streetAddresses.some(e => e.value.toLowerCase().includes($globalSearchTerm)) ||
      p.notes?.toLowerCase().includes($globalSearchTerm))
    : persons;

  $: $globalSearchTerm && clearSelected();
  $: selectedAddressbook, clearSelected();
  function clearSelected() {
    if (!filteredPersons.contains($selectedPerson)) {
      $selectedPerson = filteredPersons.first;
    }
  }
</script>

<style>
  .left-pane {
    border-right: 1px dotted var(--border);
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on PersonDetails */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .right-pane {
    background: url(../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    background-blend-mode: soft-light;
    color: var(--main-pattern-fg);
  }
</style>
