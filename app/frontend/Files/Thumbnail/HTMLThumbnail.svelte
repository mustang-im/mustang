<iframe
  src={$file.url}
  title={$file.name}
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";

  export let file: File;
  export let size = 16;
</script>

<script lang="ts" context="module">
  export const kSupportedExt = ["html", "htm", "shtml", "txt", "pdf"];
</script>

<style>
  iframe {
    border: none;
    width: 100%;
    height: 100%;
  }
</style>
