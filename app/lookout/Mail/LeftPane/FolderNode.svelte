<FolderLine {folder} {depth} {isFavorite} hasChildren={$subFolders.hasItems} {isExpanded} on:toggle={onToggle} />
{#if isExpanded && $subFolders.hasItems}
  {#each $sortedSubFolders.each as subFolder (subFolder)}
    <svelte:self folder={subFolder} depth={depth + 1} />
  {/each}
{/if}

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import FolderLine from "./FolderLine.svelte";

  export let folder: Folder;
  export let depth = 0;
  export let isFavorite = false;

  $: subFolders = folder.subFolders;
  $: sortedSubFolders = folder.subFolders.sortBy(subFolder => subFolder.orderPos);
  const expandedIDs = getLocalStorage<string[]>("lookout.mail.expandedFolders", []);
  $: nodeID = folder.account?.id + "/" + folder.id;
  $: isExpanded = !isFavorite && ($expandedIDs.value ?? []).includes(nodeID);

  /* <copied to="SearchFoldersNode.svelte"> */
  function onToggle() {
    let ids = ($expandedIDs.value ?? []).filter(existing => existing != nodeID);
    if (!isExpanded) {
      ids.push(nodeID);
    }
    $expandedIDs.value = ids;
  }
  /* </copied> */
</script>
