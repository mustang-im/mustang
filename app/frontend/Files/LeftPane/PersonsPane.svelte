<vbox flex class="persons-file-pane">
  {#await filterPersons()}
    <hbox class="progress">{$t`Searching...`}</hbox>
  {:then}
  <PersonsList {persons} bind:selected={$selectedPerson} />
  {:catch ex}
    <ErrorMessageInline {ex} />
  {/await}
</vbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import { Person } from "../../../logic/Abstract/Person";
  import { PersonUID } from "../../../logic/Abstract/PersonUID";
  import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
  import { selectedPerson } from "../../Contacts/Person/Selected";
  import PersonsList from "../../Contacts/Person/PersonsList.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import { catchErrors } from "../../Util/error";
  import { ArrayColl, Collection, MapColl, SetColl } from 'svelte-collections';
  import { t } from "../../../l10n/l10n";

  /** The list of files and folders to show on the right pane
   * in/out only */
  export let listFiles: Collection<File>;
  export let listDirs: Collection<Directory>;

  let persons = new SetColl<Person>();

  // onMount(() => catchErrors(filterPersons));

  /** Show only those persons that have files*/
  async function filterPersons(): Promise<Collection<Person>> {
    persons.clear();
    let uids = new MapColl<string, PersonUID>();
    let search = newSearchEMail();
    search.hasAttachment = true;
    let emails = await search.startSearch();
    for (let email of emails) {
      let hasAttachment = email.attachments.hasItems && email.attachments.some(a => !a.hidden);
      if (!hasAttachment) {
        continue;
      }
      if (email.contact instanceof Person) {
        persons.add(email.contact);
      } else if (email.contact instanceof PersonUID) {
        uids.set(email.contact.emailAddress, email.contact);
      }
    }
    for (let uid of uids.contents) {
      let person = uid.findPerson();
      if (!person) {
        continue;
      }
      persons.add(person);
    }
    return persons;
  }

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
        if (attachment.hidden) {
          continue;
        }
        listFiles.add(attachment.asFileEntry());
      }
    }
    console.log("found", listFiles.length, "files and", listDirs.length, "dirs from/to", person.name);
  }
</script>

<style>
  .persons-file-pane {
    margin-block-start: 8px;
  }
  .progress {
    align-self: center;
    justify-self: center;
  }
</style>
