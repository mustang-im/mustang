{#each $sortedFolders.each as folder (folder)}
  <FolderNode {folder} depth={0} />
{:else}
  {#if !$account.isLoggedIn}
    <hbox class="empty">{$t`Not connected`}</hbox>
  {/if}
{/each}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import FolderNode from "./FolderNode.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  $: sortedFolders = account.rootFolders.sortBy(folder => folder.orderPos);
</script>

<style>
  .empty {
    padding: 4px 8px 4px 28px;
    color: var(--lo-fg-secondary);
    font-size: 13px;
  }
</style>
