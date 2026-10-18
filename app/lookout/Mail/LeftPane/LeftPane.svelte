<vbox flex class="folder-pane">
  <hbox class="pane-top">
    <hbox flex />
    <button class="minimize" on:click={onMinimize}
      title={$t`Minimize the Folder Pane`} aria-label={$t`Minimize the Folder Pane`}>
      <MinimizeIcon size={16} />
    </button>
  </hbox>
  <vbox flex class="scroll" role="tree" aria-label={$t`Folders`}>
    {#if $showFavorites.value}
      <SectionHeader id="favorites" label={$t`Favorites`} />
      {#if !isCollapsed("favorites", $collapsedIDs.value)}
        {#each $favorites.each as folder (folder)}
          <FolderNode {folder} depth={0} isFavorite bind:selectedFolder />
        {/each}
      {/if}
    {/if}
    {#if $separateAccountList.value}
      <SectionHeader id="accounts" label={$t`Accounts`} />
      {#if !isCollapsed("accounts", $collapsedIDs.value)}
        <vbox class="account-list" role="listbox" aria-label={$t`Accounts`}>
          {#each accountTrees as account (account.id)}
            <AccountListItem {account} selected={account == shownAccount} on:click={() => onSelectAccount(account)} />
          {/each}
        </vbox>
      {/if}
      {#if shownAccount}
        <SectionHeader id={shownAccount.id} account={shownAccount} />
        {#if !isCollapsed(shownAccount.id, $collapsedIDs.value)}
          <FolderList folders={shownAccount.rootFolders} account={shownAccount} bind:selectedFolder />
        {/if}
      {/if}
    {:else}
      {#each accountTrees as account (account.id)}
        <SectionHeader id={account.id} {account} />
        {#if !isCollapsed(account.id, $collapsedIDs.value)}
          <FolderList folders={account.rootFolders} {account} bind:selectedFolder />
        {/if}
      {/each}
    {/if}
    {#if allAccountSearches.length}
      <SectionHeader id="search-folders" label={$t`Search Folders`} />
      {#if !isCollapsed("search-folders", $collapsedIDs.value)}
        {#each allAccountSearches as folder (folder)}
          <FolderNode {folder} depth={0} bind:selectedFolder />
        {/each}
      {/if}
    {/if}
  </vbox>
</vbox>

<script lang="ts" context="module">
  export enum FolderPaneMode {
    Normal = "normal",
    Minimized = "minimized",
    Off = "off",
  }
</script>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { allAccountsAccount } from "../../../logic/Mail/AccountsList/ShowAccounts";
  import { savedSearchFolders } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import SectionHeader from "./SectionHeader.svelte";
  import FolderList from "./FolderList.svelte";
  import AccountListItem from "./AccountListItem.svelte";
  import FolderNode from "./FolderNode.svelte";
  import MinimizeIcon from "lucide-svelte/icons/chevron-left";
  import { t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let accounts: Collection<MailAccount>;
  export let selectedAccount: MailAccount | null;
  export let selectedFolder: Folder | null;

  const showFavorites = getLocalStorage<boolean>("lookout.mail.showFavorites", true);
  const favorites = allAccountsAccount.specialFolders;
  const savedSearches = savedSearchFolders;
  $: allAccountSearches = $savedSearches.contents.filter(folder => !folder.search.account || !$accounts.contains(folder.search.account));
  const collapsedIDs = getLocalStorage<string[]>("lookout.mail.collapsedSections", []);
  const separateAccountList = getLocalStorage<boolean>("lookout.mail.separateAccountList", false);
  const folderPane = getLocalStorage<FolderPaneMode>("lookout.mail.folderPane", FolderPaneMode.Normal);

  let shownAccount: MailAccount = null;
  $: shownAccount = accountToShow(selectedAccount, accountTrees);
  function accountToShow(selected: MailAccount, all: MailAccount[]): MailAccount {
    if (all.includes(selected)) {
      return selected;
    }
    return all.includes(shownAccount) ? shownAccount : all[0] ?? null;
  }

  $: accountTrees = mainAccountsFirst($accounts.contents);
  function mainAccountsFirst(all: MailAccount[]): MailAccount[] {
    let ordered: MailAccount[] = [];
    for (let account of all.filter(account => !account.isDependentAccount)) {
      ordered.push(account);
      ordered.push(...all.filter(dependent => dependent.isDependentAccount && dependent.mainAccount == account));
    }
    ordered.push(...all.filter(account => !ordered.includes(account)));
    return ordered;
  }

  function onSelectAccount(account: MailAccount) {
    selectedAccount = account;
    if (selectedFolder?.account != account) {
      selectedFolder = account.inbox ?? null;
    }
  }

  $: selectedFolder, selectAccountOfFolder();
  function selectAccountOfFolder() {
    if (selectedFolder && selectedFolder.account != selectedAccount) {
      selectedAccount = selectedFolder.account;
    }
  }

  function isCollapsed(id: string, collapsedIDs: string[]): boolean {
    return (collapsedIDs ?? []).includes(id);
  }

  function onMinimize() {
    $folderPane.value = FolderPaneMode.Minimized;
  }
</script>

<style>
  .folder-pane {
    min-height: 0;
    min-width: 0;
    padding: 0 4px 8px 8px;
  }
  .pane-top {
    flex-shrink: 0;
    height: 24px;
    align-items: center;
  }
  .minimize {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .minimize:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .account-list {
    flex-shrink: 0;
  }
  .scroll {
    flex: 1 0 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
