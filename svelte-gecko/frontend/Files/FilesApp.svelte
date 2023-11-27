<hbox flex class="contacts app">
  <vbox class="left-pane">
    <PersonsList {persons} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane">
    {#if displayFiles}
      <FilesList files={displayFiles} />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import PersonsList from "../Contacts/PersonsList.svelte";
  import FilesList from "./FilesList.svelte";
  import type { Collection } from "svelte-collections";

  export let persons: Collection<Person>;

  let selectedPerson: Person;
  $: personFolders = appGlobal.files.filter(file => file.sentToFrom == selectedPerson);
  $: displayFiles = personFolders?.first?.files;
</script>

<style>
  .left-pane {
    flex: 1 0 0;
    max-width: 20em;
  }
  .right-pane {
    flex: 2 0 0;
  }
</style>
