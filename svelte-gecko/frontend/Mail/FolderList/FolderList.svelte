<vbox class="folder-list">
  <FastList items={folders} selectedItem={selectedFolder} rowHeight={20}>
    <svelte:fragment slot="header">
      <hbox>Folders</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={folder}>
      <hbox>{folder.name}</hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { MsgFolder } from "mustang-lib";
  import type { Collection } from 'jscollections';
  import FastList from "../../Shared/FastList.svelte";

  export let folders: Collection<MsgFolder>;
  export let selectedFolder: MsgFolder; /* in/out */
</script>

<style>
  .folder-list {
    flex: 1 0 0;
  }
</style>
