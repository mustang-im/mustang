<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <PersonsList {persons} bind:selected={selectedPerson}/>
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if displayFiles}
      <FilesList files={displayFiles} />
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import type { Person } from "../../logic/Abstract/Person";
  import { appGlobal } from "../../logic/app";
  import FilesList from "./FilesList.svelte";
  import PersonsList from "../Shared/Person/PersonsList.svelte";
  import Splitter from "../Shared/Splitter.svelte";

  let persons = appGlobal.persons;
  let selectedPerson: Person;
  $: personFolders = appGlobal.files.filter(file => file.sentToFrom == selectedPerson);
  $: displayFiles = personFolders?.first?.files;
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: #F9F9FD;
  }
  .right-pane {
    background-color: #F9F9FD;
  }
</style>
