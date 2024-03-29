<vbox flex class="folder-list">
  <FastList items={foldersSorted} bind:selectedItem={selectedFolder} columns="auto">
    <svelte:fragment slot="header">
      <hbox class="header">Folders</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={folder}>
      <hbox class="folder" on:drop={(event) => catchErrors(() => onDropMail(event, folder))} on:dragover={(event) => catchErrors(() => onDragOverMail(event, folder))}>
        <hbox class="icon">
          <FolderIcon {folder} size="14px" />
        </hbox>
        <hbox class="label">{folder.name}</hbox>
      </hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import { onDropMail, onDragOverMail } from '../Message/drag';
  import FolderIcon from './FolderIcon.svelte';
  import FastList from "../../Shared/FastList.svelte";
  import { catchErrors } from '../../Util/error';
  import type { Collection } from 'svelte-collections';

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
  .folder {
    align-items: center;
    padding-left: 12px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    padding-left: 8px;
  }
</style>
