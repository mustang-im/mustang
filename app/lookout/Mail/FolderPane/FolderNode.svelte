<FolderRow {folder} {depth} {isFavorite} hasChildren={$subFolders.hasItems} {isExpanded} on:toggle={onToggle} />
{#if isExpanded && $subFolders.hasItems}
  {#each $sortedSubFolders.each as subFolder (subFolder)}
    <svelte:self folder={subFolder} depth={depth + 1} />
  {/each}
{/if}

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { MailView } from "../MailView";
  import FolderRow from "./FolderRow.svelte";

  export let folder: Folder;
  export let depth = 0;
  export let isFavorite = false;

  $: subFolders = folder.subFolders;
  $: sortedSubFolders = folder.subFolders.sortBy(subFolder => subFolder.orderPos);
  const expandedIDs = MailView.expandedFolders;
  $: isExpanded = !isFavorite && $expandedIDs && MailView.isFolderExpanded(folder);

  function onToggle() {
    MailView.setFolderExpanded(folder, !isExpanded);
  }
</script>
