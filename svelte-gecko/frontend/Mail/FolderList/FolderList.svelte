<vbox class="folder-list">
  <FastList list={folders} selectedItem={selectedFolder}>
    <header slot="header">
      <hbox>Folders</hbox>
    </header>
    <row rowheight="20" slot="row">
      <hbox field="name"></hbox>
    </row>
  </FastList>
</vbox>

<script lang="ts">
  import FastList from "../../Util/FastList.svelte";

  export let folders: Collection<Folder>;
  export let selectedFolder: Folder; /* in/out */
</script>

<style>
  .folder-list {
    flex: 1 0 0;
  }
</style>
