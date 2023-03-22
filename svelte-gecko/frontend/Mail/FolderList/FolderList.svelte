<vbox class="folder-list">
  <FastList items={folders} selectedItem={selectedFolder} rowHeight={20}>
    <header slot="header">
      <th>Folders</th>
    </header>
    <row slot="row" let:item>
      <hbox>{item.name}</hbox>
    </row>
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
