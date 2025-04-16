<vbox flex class="pane">
  <PersonsList {persons} bind:selected={selectedPerson} size="small"
    {doSearch}
    on:click={() => catchErrors(onPersonSelected)}
    />
</vbox>
{#if $appGlobal.isMobile}
  <PersonsBarM bind:doingSearch={doSearch} />
{/if}

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import PersonsList from "../Contacts/Person/PersonsList.svelte";
  import PersonsBarM from "./PersonsBarM.svelte";
  import { goTo } from "../AppsBar/selectedApp";
  import { catchErrors } from "../Util/error";
  import { assert, sleep } from "../../logic/util/util";

  /** in/out */
  export let selectedPerson: Person;
  export let doSearch = false;

  let persons = appGlobal.persons;

  async function onPersonSelected() {
    await sleep(0.1); // wait for `<PersonsList>` to set `$selectedPerson`
    assert($selectedPerson, "Need person");
    const en = encodeURIComponent;
    goTo(`/files/person/${en($selectedPerson.id)}/files`);
  }
</script>

<style>
  .pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    margin-block-start: 12px;
  }
</style>
