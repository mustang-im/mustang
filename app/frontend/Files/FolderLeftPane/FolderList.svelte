<vbox flex class="folder-list">
  <FastTree items={foldersSorted} bind:selectedItem={selectedFolder} bind:selectedItems={selectedFolders}
    columns="auto">
    <svelte:fragment slot="header">
      <slot name="header">
        <hbox class="header font-smallest">{$t`Folders`}</hbox>
      </slot>
    </svelte:fragment>
    <TreeItemLine slot="row" let:item={folder} item={folder}>
      <FolderLine {folder} slot="row">
        <slot name="buttons" slot="buttons" let:folder {folder} />
      </FolderLine>
    </TreeItemLine>
  </FastTree>
</vbox>

<script lang="ts">
  import type { Directory } from '../../../logic/Files/Directory';
  import FastTree from '../../Shared/FastTree.svelte';
  import type { Collection, ArrayColl } from 'svelte-collections';
  import FolderLine from './FolderLine.svelte';
  import TreeItemLine from '../../Shared/FastTreeItem.svelte';
  import { t } from '../../../l10n/l10n';

  export let folders: Collection<Directory>;
  export let selectedFolder: Directory; /* in/out */
  export let selectedFolders: ArrayColl<Directory>;

  $: foldersSorted = $folders.sortBy(f => f.name);
</script>

<style>
  .folder-list :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    padding-inline-start: 10px !important;
    color: grey;
  }
</style>
