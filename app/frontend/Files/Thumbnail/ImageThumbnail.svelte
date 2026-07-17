<img
  src={$file.url}
  title={$file.nameWithoutExt} alt=""
  class:preview
  />

<script lang="ts">
  import { File } from "../../../logic/Files/File";

  export let file: File;
  export let preview: boolean;
</script>

<script lang="ts" context="module">
  export const kSupportedExt = ["png", "gif", "jpg", "jpeg", "svg", "jpe"];
</script>

<style>
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  img.preview {
    object-fit: cover;
  }
</style>
