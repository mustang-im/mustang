{#each $dirs?.each as dir }
  <DirectoryTile {dir} {indent} />
{/each}
<hbox class="linebreak" />
{#each $files?.each as file }
  <FileTile {file} {indent} />
{/each}

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import DirectoryTile from "./DirectoryTile.svelte";
  import FileTile from "./FileTile.svelte";
  import type { Collection } from "svelte-collections";

  export let files: Collection<File>;
  export let dirs: Collection<Directory>;
  export let indent = 0;
</script>

<style>
  .linebreak {
    width: 100%;
    height: 0;
  }
</style>
