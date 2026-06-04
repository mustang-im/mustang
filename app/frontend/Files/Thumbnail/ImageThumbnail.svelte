<img
  src={$file.url}
  title={$file.nameWithoutExt} alt=""
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";

  export let file: File;
  export let size = 16;
</script>

<script lang="ts" context="module">
  export const kSupportedExt = ["png", "gif", "jpg", "jpeg", "svg", "jpe"];
</script>

<style>
  img {
    width: 100%;
    height: 100%;
  }
</style>
