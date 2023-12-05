<vbox flex class="folder-list">
  <FastList items={folders} bind:selectedItem={selectedFolder}>
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
  import type { Collection } from 'svelte-collections';
  import FastList from "../../Shared/FastList.svelte";

  export let folders: Collection<MsgFolder>;
  export let selectedFolder: MsgFolder; /* in/out */
</script>

<style>
  .folder-list :global(.fast-list thead tr hbox) {
    background-color: transparent;
  }
</style>
