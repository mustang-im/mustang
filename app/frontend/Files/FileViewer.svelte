<Thumbnail {file} preview={false} />

<script lang="ts">
  import type { File } from "../../logic/Files/File";
  import Thumbnail from "./Thumbnail/Thumbnail.svelte";

  export let file: File;
</script>
