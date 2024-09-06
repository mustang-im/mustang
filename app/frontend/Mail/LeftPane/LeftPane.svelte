<vbox flex class="folder-pane">
    <hbox class="top">
      <vbox class="island">
        <SearchSwitcher bind:active={activeTab} />
      </vbox>
      <hbox flex />
      <hbox class="buttons">
        {#if activeTab == 0}
          <GetMailButton folder={selectedFolder ?? selectedAccount?.getSpecialFolder(SpecialFolder.Inbox)} />
        {/if}
        {#if activeTab == 0 || activeTab == 1}
          <WriteButton {selectedAccount} />
        {/if}
      </hbox>
    </hbox>

  {#if activeTab == 1}
    <PersonsList persons={appGlobal.persons}  bind:selected={$selectedPerson} size="small" />
    <ViewSwitcher />
  {:else if activeTab == 2}
    <SearchPane bind:searchMessages on:clear={onClearSearch} />
  {:else}
    <!--<ProjectList />-->
    <AccountList accounts={$accounts} bind:selectedAccount />
    <FolderList {folders} bind:selectedFolder bind:selectedFolders />
    {#if selectedFolder && !(selectedFolder instanceof SavedSearchFolder)}
      <TagsList folder={selectedFolder} bind:searchMessages />
    {/if}
    <hbox class="separator" />
    <ViewSwitcher />
  {/if}
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { type Folder, SpecialFolder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Person } from "../../../logic/Abstract/Person";
  import { selectedPerson } from "../../Shared/Person/Selected";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import { SQLSearchEMail } from "../../../logic/Mail/SQL/SQLSearchEMail";
  import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { appGlobal } from "../../../logic/app";
  import AccountList from "./AccountList.svelte";
  import FolderList from "./FolderList.svelte";
  import TagsList from "./TagsList.svelte";
  import SearchPane from "../Search/SearchPane.svelte";
  import PersonsList from "../../Shared/Person/PersonsList.svelte";
  import ProjectList from "./ProjectList.svelte";
  import GetMailButton from "./GetMailButton.svelte";
  import WriteButton from "./WriteButton.svelte";
  import ViewSwitcher from "./ViewSwitcher.svelte";
  import SearchSwitcher, { SearchView } from "./SearchSwitcher.svelte";
  import { catchErrors } from "../../Util/error";
  import type { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let folders: Collection<Folder>; /** in */
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedFolders: ArrayColl<Folder>;

  let activeTab = SearchView.Folder;
  $: if (!!$globalSearchTerm) {
    activeTab = SearchView.Search;
  }
  $: if (activeTab != SearchView.Search) {
    searchMessages = null;
  }

  function onClearSearch() {
    activeTab = SearchView.Folder;
  }
  $: activeTab == SearchView.Person && $selectedPerson && catchErrors(() => showPerson($selectedPerson))
  async function showPerson(person: Person) {
    let search = new SQLSearchEMail();
    search.includesPerson = person;
    //let folder = new SavedSearchFolder(search);
    //selectedFolder = folder;
    searchMessages = await search.startSearch();
  }

  // Search.svelte is removed here above, and therefore cannot react anymore, so have to do it here.
  // Reproduction: window title | search field | (x) button
  $: if (!$globalSearchTerm) onClearSearch();
</script>

<style>
  .folder-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    z-index: 2;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }

  .folder-pane :global(.persons) {
    margin-block-start: 8px;
  }
  .folder-pane :global(.account-list) {
    margin-block-start: -4px;
  }
  .folder-pane :global(.search) {
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
