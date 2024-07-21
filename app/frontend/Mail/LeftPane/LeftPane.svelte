<vbox flex class="folder-pane">
    <hbox class="top">
      <Tabs bind:active={activeTab} on:change={onTabChange}>
        <Tabs.Tab icon={FolderIcon}></Tabs.Tab>
        <Tabs.Tab icon={PersonIcon}></Tabs.Tab>
        <Tabs.Tab icon={SearchIcon}></Tabs.Tab>
      </Tabs>
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
    <hbox class="island-border">
      <ViewSwitcher />
    </hbox>
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
  import { appGlobal } from "../../../logic/app";
  import AccountList from "./AccountList.svelte";
  import FolderList from "./FolderList.svelte";
  import SearchPane from "../Search/SearchPane.svelte";
  import PersonsList from "../../Shared/Person/PersonsList.svelte";
  import ProjectList from "./ProjectList.svelte";
  import GetMailButton from "./GetMailButton.svelte";
  import WriteButton from "./WriteButton.svelte";
  import ViewSwitcher from "./ViewSwitcher.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import FolderIcon from "lucide-svelte/icons/folder";
  import PersonIcon from "lucide-svelte/icons/user";
  import { catchErrors } from "../../Util/error";
  import { Tabs } from "@svelteuidev/core";
  import type { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let folders: Collection<Folder>; /** in */
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedFolders: ArrayColl<Folder>;

  let activeTab = 0;
  $: if (!!$globalSearchTerm) {
    activeTab = 2;
  }
  $: if (activeTab != 2) {
    searchMessages = null;
  }
  $: if (activeTab >= 0) searchMessages = null;

  function onClearSearch() {
    activeTab = 0;
  }
  function onTabChange(event) {
    activeTab = event.detail.index;
  }
  $: activeTab == 1 && $selectedPerson && catchErrors(() => showPerson($selectedPerson))
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
  .island-border {
    margin: 6px 8px;
  }
</style>
