<vbox flex class="folder-list">
  <FastList items={foldersSorted} bind:selectedItem={selectedFolder} columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">Folders</hbox>
    </svelte:fragment>
    <FolderLine {folder} let:item={folder} slot="row"/>
  </FastList>
</vbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import FastList from "../../Shared/FastList.svelte";
  import type { Collection } from 'svelte-collections';
  import FolderLine from './FolderLine.svelte';

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
