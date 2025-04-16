<vbox flex class="pane">
  <PersonsList {persons} bind:selected={selectedPerson} size="small" {doSearch} />
</vbox>
{#if $appGlobal.isMobile}
  <PersonsBarM bind:doingSearch={doSearch} />
{/if}

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import PersonsList from "../Contacts/Person/PersonsList.svelte";
  import PersonsBarM from "./PersonsBarM.svelte";

  /** in/out */
  export let selectedPerson: Person;
  export let doSearch = false;

  let persons = appGlobal.persons;
</script>

<style>
  .pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    margin-block-start: 12px;
  }
</style>
