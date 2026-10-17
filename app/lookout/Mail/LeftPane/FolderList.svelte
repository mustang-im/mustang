{#each $sortedFolders.each as folder (folder)}
  <FolderNode {folder} depth={0} />
{:else}
  {#if !$account.isLoggedIn}
    <hbox class="empty">
      <span>{$t`Not connected`}</span>
      <ConnectButton {account} withLabel />
    </hbox>
  {/if}
{/each}
<SearchFoldersNode folders={$savedSearches.contents.filter(folder => folder.search.account == account)}
  nodeID={account.id + "/search-folders"} />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { savedSearchFolders } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import FolderNode from "./FolderNode.svelte";
  import SearchFoldersNode from "./SearchFoldersNode.svelte";
  import ConnectButton from "./ConnectButton.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  const savedSearches = savedSearchFolders;

  $: sortedFolders = account.rootFolders.sortBy(folder => folder.orderPos);
</script>

<style>
  .empty {
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 8px 4px 28px;
    color: var(--lo-fg-secondary);
    font-size: 13px;
  }
</style>
