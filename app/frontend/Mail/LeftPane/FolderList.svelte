<vbox flex class="folder-list">
  <FastTree items={foldersSorted} bind:selectedItem={selectedFolder} bind:selectedItems={selectedFolders}
    columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">Folders</hbox>
    </svelte:fragment>
    <TreeItemLine slot="row" let:item={folder} item={folder}>
      <FolderLine folder={folder} slot="row" />
    </TreeItemLine>
  </FastTree>
</vbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import FastTree from '../../Shared/FastTree.svelte';
  import type { Collection, ArrayColl } from 'svelte-collections';
  import FolderLine from './FolderLine.svelte';
  import TreeItemLine from './TreeItemLine.svelte';

  export let folders: Collection<Folder>;
  export let selectedFolder: Folder; /* in/out */
  export let selectedFolders: ArrayColl<Folder>;

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
