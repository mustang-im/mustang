<Splitter name="persons-list" initialRightRatio={4}>
  <vbox flex class="left-pane" slot="left">
    <PersonsToolbar {persons} bind:selectedAddressbook />
    <PersonsList {persons} bind:selected={$selectedPerson} size="small" bind:searchTerm={$globalSearchTerm} />
  </vbox>
  <vbox flex class="right-pane background-pattern" slot="right">
    {#if $selectedPerson && $selectedPerson instanceof Person}
      <Scroll>
        <PersonDetails person={$selectedPerson} />
      </Scroll>
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import { Person } from "../../logic/Abstract/Person";
  import { Addressbook } from "../../logic/Contacts/Addressbook";
  import { selectedPerson } from "./Person/Selected";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import PersonsList from "./Person/PersonsList.svelte";
  import PersonDetails from "./PersonDetails.svelte";
  import PersonsToolbar from "./PersonsToolbar.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import type { Collection } from "svelte-collections";

  let selectedAddressbook: Addressbook | null = null; /** null = show all */

  $: $globalSearchTerm && showAll()
  function showAll() {
    selectedAddressbook = null;
    // This must be above the `$: persons` statement, so that `persons` will be adapted and then the search happens
  }

  $: persons = (selectedAddressbook?.persons ?? appGlobal.persons) as Collection<Person>;
</script>

<style>
  .left-pane {
    border-right: 1px dotted var(--border);
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on PersonDetails */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
</style>
