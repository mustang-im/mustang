<Scroll>
  <grid class="gallery">
    <FileOrDirTiles {files} {dirs} />
  </grid>
</Scroll>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { Directory } from "../../../logic/Files/Directory";
  import FileOrDirTiles from "./FileOrDirTiles.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Collection } from "svelte-collections";

  export let files: Collection<File>;
  export let dirs: Collection<Directory>;
</script>

<style>
  .gallery {
    display: flex;
    flex-wrap: wrap;
    margin-inline-start: 12px;
  }
</style>
