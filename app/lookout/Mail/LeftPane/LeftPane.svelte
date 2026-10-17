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
      {#if !isCollapsed("favorites", $collapsedIDs)}
        {#each $favorites.each as folder (folder)}
          <FolderNode {folder} depth={0} isFavorite />
        {/each}
      {/if}
    {/if}
    {#if $separateAccountList.value}
      <SectionHeader id="accounts" label={$t`Accounts`} />
      {#if !isCollapsed("accounts", $collapsedIDs)}
        <vbox class="account-list" role="listbox" aria-label={$t`Accounts`}>
          {#each accountTrees as account (account.id)}
            <AccountListItem {account} selected={account == shownAccount} />
          {/each}
        </vbox>
      {/if}
      {#if shownAccount}
        <SectionHeader id={shownAccount.id} account={shownAccount} />
        {#if !isCollapsed(shownAccount.id, $collapsedIDs)}
          <FolderList account={shownAccount} />
        {/if}
      {/if}
    {:else}
      {#each accountTrees as account (account.id)}
        <SectionHeader id={account.id} {account} />
        {#if !isCollapsed(account.id, $collapsedIDs)}
          <FolderList {account} />
        {/if}
      {/each}
    {/if}
    {#if allAccountSearches.length}
      <SectionHeader id="search-folders" label={$t`Search Folders`} />
      {#if !isCollapsed("search-folders", $collapsedIDs)}
        {#each allAccountSearches as folder (folder)}
          <FolderNode {folder} depth={0} />
        {/each}
      {/if}
    {/if}
  </vbox>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { allAccountsAccount } from "../../../logic/Mail/AccountsList/ShowAccounts";
  import { savedSearchFolders } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { appGlobal } from "../../../logic/app";
  import { selectedAccount } from "../../../frontend/Mail/Selected";
  import { FolderPaneMode, MailView } from "../MailView";
  import SectionHeader from "./SectionHeader.svelte";
  import FolderList from "./FolderList.svelte";
  import AccountListItem from "./AccountListItem.svelte";
  import FolderNode from "./FolderNode.svelte";
  import MinimizeIcon from "lucide-svelte/icons/chevron-left";
  import { t } from "../../../l10n/l10n";

  const showFavorites = MailView.showFavorites;
  const favorites = allAccountsAccount.specialFolders;
  const savedSearches = savedSearchFolders;
  $: allAccountSearches = $savedSearches.contents.filter(folder => !folder.search.account || !$accounts.contains(folder.search.account));
  const accounts = appGlobal.emailAccounts;
  const collapsedIDs = MailView.collapsedSections;
  const separateAccountList = MailView.separateAccountList;

  let shownAccount: MailAccount = null;
  $: shownAccount = accountToShow($selectedAccount, accountTrees);
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

  function isCollapsed(id: string, _collapsedIDs: any): boolean {
    return MailView.isSectionCollapsed(id);
  }

  function onMinimize() {
    MailView.folderPane.value = FolderPaneMode.Minimized;
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
