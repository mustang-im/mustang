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
    {#each accountTrees as account (account.id)}
      <SectionHeader id={account.id} label={account.name} tooltip={account.emailAddress} {account} />
      {#if !isCollapsed(account.id, $collapsedIDs)}
        <AccountFolders {account} />
      {/if}
    {/each}
    {#if $savedSearches.hasItems}
      <SectionHeader id="search-folders" label={$t`Search Folders`} />
      {#if !isCollapsed("search-folders", $collapsedIDs)}
        {#each $savedSearches.each as folder (folder)}
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
  import { FolderPaneMode, MailView } from "../MailView";
  import SectionHeader from "./SectionHeader.svelte";
  import AccountFolders from "./AccountFolders.svelte";
  import FolderNode from "./FolderNode.svelte";
  import MinimizeIcon from "lucide-svelte/icons/chevron-left";
  import { t } from "../../../l10n/l10n";

  const showFavorites = MailView.showFavorites;
  const favorites = allAccountsAccount.specialFolders;
  const savedSearches = savedSearchFolders;
  const accounts = appGlobal.emailAccounts;
  const collapsedIDs = MailView.collapsedSections;

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
  .scroll {
    flex: 1 0 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
