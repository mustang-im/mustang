<vbox flex class="left-pane">
  <hbox class="top">
    <vbox class="island">
      <ViewSwitcher bind:active={activeTab} />
    </vbox>
    <hbox flex />
  </hbox>

  {#if activeTab == FilesView.Recent}
    <RecentList bind:viewFile />
  {:else if activeTab == FilesView.Person}
    <PersonsList {persons} bind:selected={selectedPerson} size="small" />
  {:else if activeTab == FilesView.Project}
    <!---->
  {:else if activeTab == FilesView.Search}
    <SearchPane searchFiles={listFiles} on:clear={endSearchMode} />
  {:else if activeTab == FilesView.CloudStorage || activeTab == FilesView.Harddrive}
    {#if activeTab == FilesView.CloudStorage}
      <AccountList accounts={appGlobal.fileSharingAccounts} bind:selectedAccount />
    {/if}
    <FolderList {folders} bind:selectedFolder bind:selectedFolders />
    {#if selectedFolder}
      <TagsList folder={selectedFolder} bind:searchFiles />
    {/if}
  {/if}
</vbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import { FileOrDirectory } from "../../../logic/Files/FileOrDirectory";
  import { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import type { Person } from "../../../logic/Abstract/Person";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import { newSearchEMail } from "../../../logic/Mail/Store/setStorage";
  import { appGlobal } from "../../../logic/app";
  import AccountList from "./AccountList.svelte";
  import FolderList from "./FolderList.svelte";
  import SearchPane from "../Search/SearchPane.svelte";
  import RecentList from "./RecentList.svelte";
  import PersonsList from "../../Contacts/Person/PersonsList.svelte";
  import TagsList from "./TagsList.svelte";
  import ViewSwitcher, { FilesView } from "./ViewSwitcher.svelte";
  import { catchErrors } from "../../Util/error";
  import { ArrayColl, Collection } from 'svelte-collections';

  /** The list of files and folders to show on the right pane
   * in only. May `clear()`. */
  export let listFiles: ArrayColl<FileOrDirectory>;
  /** out only */
  export let viewFile: File | null = null;

  let selectedAccount: FileSharingAccount;
  let selectedFolder: Directory;
  let selectedFolders: ArrayColl<Directory>;
  let selectedPerson: Person;
  let persons = appGlobal.persons;
  let folders = new ArrayColl<Directory>(); // TODO
  let searchFiles: Collection<FileOrDirectory> | null;

  // $: personFolders = appGlobal.files.filter(file => file.sentToFrom == selectedPerson);
  // $: displayFiles = personFolders?.first?.files;

  let activeTab = FilesView.Harddrive;
  $: if (!!$globalSearchTerm) openSearchPane();
  function openSearchPane() {
    activeTab = FilesView.Search;
  }
  $: activeTab, changeTab();
  function changeTab() {
    lastPerson = null;
    if (activeTab == FilesView.Search) {
      if ($globalSearchTerm == null) {
        $globalSearchTerm = "";
      }
    } else {
      listFiles.clear();
    }
  }

  // Search.svelte is removed here above, and therefore cannot react anymore, so have to do it here.
  // Reproduction: window title | search field | (x) button
  $: if ($globalSearchTerm == null) endSearchMode();
  function endSearchMode() {
    activeTab = FilesView.Harddrive;
  }

  let lastPerson: Person;
  $: activeTab == FilesView.Person && selectedPerson && catchErrors(() => showPerson(selectedPerson))
  async function showPerson(person: Person) {
    if (lastPerson == person) {
      return;
    }
    lastPerson = person;
    if (!person) {
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
        file.size = attachment.size;
        file.mimetype = attachment.mimeType;
        file.contents = attachment.content;
        file.id = attachment.contentID;
        listFiles.add(file);
      }
    }
    console.log("found", listFiles.length, "files from", selectedPerson.name);
  }
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%);
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }

  .left-pane :global(.persons) {
    margin-block-start: 8px;
  }
  .left-pane :global(.account-list) {
    margin-block-start: -4px;
  }
  .left-pane :global(.search) {
    margin-block-start: -2px;
  }
  .separator {
    margin-block-start: 20px;
  }
  .top :global(.svelteui-Tab) {
    padding: 8px 12px;
    height: unset;
  }
  .buttons {
    margin: 8px 8px 0 8px;
    align-items: end;
  }
  .buttons :global(button) {
    margin-inline-start: 6px;
  }
  .buttons :global(svg) {
    margin: 4px;
  }
  .buttons :global(.get-mail) {
    height: 22px;
  }
  .island {
    margin: 8px 12px;
  }
</style>
