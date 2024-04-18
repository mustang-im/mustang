<vbox flex class="folder-list">
  <FastTree items={foldersSorted} bind:selectedItem={selectedFolder} columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">Folders</hbox>
    </svelte:fragment>
    <TreeItemLine slot="row" let:item={folder} let:indentionLevel {indentionLevel} let:isExpanded {isExpanded} let:isTree {isTree}>
      <FolderLine folder={folder} slot="row" />
    </TreeItemLine>
  </FastTree>
</vbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import FastTree from '../../Shared/FastTree.svelte';
  import type { Collection } from 'svelte-collections';
  import FolderLine from './FolderLine.svelte';
  import TreeItemLine from './TreeItemLine.svelte';

  export let folders: Collection<Folder>;
  export let selectedFolder: Folder; /* in/out */

  $: foldersSorted = folders.sortBy(f => f.orderPos);
</script>

<style>
  .folder-list :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    padding-left: 10px !important;
    color: grey;
    font-size: 12px;
  }
</style>
