<vbox class="folder-list">
  <FastList list={folders} selectedItem={selectedFolder}>
    <header slot="header">
      <th>Folders</th>
    </header>
    <row rowheight="20" slot="row">
      <hbox field="name"></hbox>
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
