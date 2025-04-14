<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <PersonsList {persons} bind:selected={selectedPerson} size="small" />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if displayFiles}
      <FilesList files={displayFiles} />
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import { File, FileOrDirectory } from "../../logic/Files/File";
  import type { Person } from "../../logic/Abstract/Person";
  import { newSearchEMail } from "../../logic/Mail/Store/setStorage";
  import { appGlobal } from "../../logic/app";
  import FilesList from "./FilesList.svelte";
  import PersonsList from "../Contacts/Person/PersonsList.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { ArrayColl } from "svelte-collections";
  import { catchErrors } from "../Util/error";

  let persons = appGlobal.persons;
  let selectedPerson: Person;
  let displayFiles = new ArrayColl<FileOrDirectory>();
  // $: personFolders = appGlobal.files.filter(file => file.sentToFrom == selectedPerson);
  // $: displayFiles = personFolders?.first?.files;

  $: selectedPerson, catchErrors(searchFiles);
  async function searchFiles() {
    displayFiles.clear();
    if (!selectedPerson) {
      return;
    }
    let search = newSearchEMail();
    search.includesPerson = selectedPerson;
    search.hasAttachment = true;
    let emails = await search.startSearch();
    for (let email of emails) {
      for (let attachment of email.attachments) {
        let file = new File();
        file.setFileName(attachment.filename);
        file.filepathLocal = attachment.filepathLocal;
        file.length = attachment.size;
        file.mimetype = attachment.mimeType;
        file.contents = attachment.content;
        file.id = attachment.contentID;
        displayFiles.add(file);
      }
    }
    console.log("found", displayFiles.length, "files from", selectedPerson.name);
  }
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 8%); /* Also on MessageList */
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    margin-block-start: 12px;
  }
  .right-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
