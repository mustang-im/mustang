<vbox flex class="persons-file-pane">
  <PersonsList {persons} bind:selected={$selectedPerson} size="small" />
</vbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import type { Person } from "../../../logic/Abstract/Person";
  import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
  import { selectedPerson } from "../../Contacts/Person/Selected";
  import { appGlobal } from "../../../logic/app";
  import PersonsList from "../../Contacts/Person/PersonsList.svelte";
  import { catchErrors } from "../../Util/error";
  import { ArrayColl, Collection } from 'svelte-collections';

  /** The list of files and folders to show on the right pane
   * in/out only */
  export let listFiles: Collection<File>;
  export let listDirs: Collection<Directory>;

  let persons = appGlobal.persons;

  // $: personFolders = appGlobal.files.filter(file => file.sentToFrom == $selectedPerson);
  // $: displayFiles = personFolders?.first?.files;

  let lastPerson: Person;
  $: $selectedPerson && catchErrors(showPerson)
  async function showPerson() {
    let person = $selectedPerson;
    if (lastPerson == person) {
      return;
    }
    lastPerson = person;
    if (!person) {
      return;
    }
    listFiles = new ArrayColl<File>();
    listDirs = new ArrayColl<Directory>();

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
        listFiles.add(file);
      }
    }
    console.log("found", listFiles.length, "files and", listDirs.length, "dirs from/to", person.name);
  }
</script>

<style>
  .persons-file-pane {
    margin-block-start: 8px;
  }
</style>
