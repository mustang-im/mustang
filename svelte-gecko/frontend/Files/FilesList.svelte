<Scroll>
  <grid class="files-list">
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
    grid-template-columns: auto max-content max-content;
  }
</style>
