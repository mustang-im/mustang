<Scroll>
  <grid class="files-list">
    <!--
    <hbox class="name">Name</hbox>
    <hbox class="type">Type</hbox>
    <hbox class="size">Size</hbox>
    <hbox class="time">Last Mod</hbox>
    -->

    {#each files.each as file (file.id) }
      <FileOrDirectoryLine {file} />
    {/each}
  </grid>
</Scroll>

<script lang="ts">
  import type { FileOrDirectory } from "../../logic/Files/File";
  import type { Collection } from "svelte-collections";
  import FileOrDirectoryLine from "./FileOrDirectoryLine.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let files: Collection<FileOrDirectory>;
</script>

<style>
  .files-list {
    display: grid;
    grid-template-columns: auto max-content max-content max-content;
    margin-top: 8px;
  }
  /*
  .name, .type, .size, .time {
    padding-left: 8px;
    padding-right: 8px;
    border-bottom: 1px dotted grey;
    border-right: 1px dotted grey;
  }
  .name {
    padding-left: 16px;
  }
  .time {
    padding-right: 16px;
  }
  */
</style>
