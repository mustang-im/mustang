<vbox flex class="pane">
  {#if displayFiles}
    <FilesList files={displayFiles} dirs={displayDirs} />
  {/if}
</vbox>
{#if $appGlobal.isMobile}
  <FilesBarM />
{/if}

<script lang="ts">
  import { File } from "../../logic/Files/File";
  import { Directory } from "../../logic/Files/Directory";
  import type { Person } from "../../logic/Abstract/Person";
  import { newSearchEMail } from "../../logic/Mail/Store/setStorage";
  import FilesList from "./FilesList/FilesList.svelte";
  import FilesBarM from "./FilesBarM.svelte";
  import { ArrayColl } from "svelte-collections";
  import { catchErrors } from "../Util/error";
  import { appGlobal } from "../../logic/app";

  export let person: Person;

  let displayFiles = new ArrayColl<File>();
  let displayDirs = new ArrayColl<Directory>();
  // $: personFolders = appGlobal.files.filter(file => file.sentToFrom == selectedPerson);
  // $: displayFiles = personFolders?.first?.files;

  $: person, catchErrors(searchFiles);
  async function searchFiles() {
    displayFiles.clear();
    if (!person) {
      return;
    }
    let search = newSearchEMail();
    search.includesPerson = person;
    search.hasAttachment = true;
    let emails = await search.startSearch();
    for (let email of emails) {
      for (let attachment of email.attachments) {
        let file = new File();
        file.setFileName(attachment.filename);
        file.filepathLocal = attachment.filepathLocal;
        file.size = attachment.size;
        file.mimetype = attachment.mimeType;
        file.contents = attachment.content;
        file.id = attachment.contentID;
        displayFiles.add(file);
      }
    }
    console.log("found", displayFiles.length, "files from", person.name);
  }
</script>

<style>
  .pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
