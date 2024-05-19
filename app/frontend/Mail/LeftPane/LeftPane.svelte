<vbox flex class="folder-pane">
  {#if isSearching}
    <Search bind:searchMessages on:clear={onClearSearch} />
  {:else}
    <!--<ProjectList />-->
    <AccountList accounts={$accounts} bind:selectedAccount>
      <hbox class="buttons" slot="top-right">
        <RoundButton icon={SearchIcon} label="Search" onClick={onOpenSearch}
          classes="small" iconSize="12px" padding="0px" />
        <GetMailButton account={selectedAccount} />
        <WriteButton {selectedAccount} />
      </hbox>
    </AccountList>
    <FolderList {folders} bind:selectedFolder bind:selectedFolders />
    <ViewSwitcher />
  {/if}
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import AccountList from "./AccountList.svelte";
  import FolderList from "./FolderList.svelte";
  import Search from "./Search.svelte";
  import ProjectList from "./ProjectList.svelte";
  import GetMailButton from "./GetMailButton.svelte";
  import WriteButton from "./WriteButton.svelte";
  import ViewSwitcher from "./ViewSwitcher.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import SearchIcon from "lucide-svelte/icons/search";
  import type { ArrayColl, Collection } from 'svelte-collections';

  export let accounts: Collection<MailAccount>; /** in */
  export let folders: ArrayColl<Folder>; /** in */
  export let searchMessages: ArrayColl<EMail> | null; /** out */
  export let selectedAccount: MailAccount; /** in/out */
  export let selectedFolder: Folder; /** in/out */
  export let selectedFolders: ArrayColl<Folder>;

  $: isSearching = !!$globalSearchTerm;

  function onClearSearch() {
    isSearching = false;
  }
  function onOpenSearch() {
    isSearching = true;
  }
</script>

<style>
  .folder-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    z-index: 2;
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }

  .buttons {
    margin: 8px 8px 0 8px;
    align-items: end;
  }
  .buttons :global(button) {
    margin-left: 6px;
  }
  .buttons :global(svg) {
    margin: 4px;
  }
</style>
