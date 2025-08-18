<WebView url={file.filepathLocal} title={file.nameWithoutExt} />

<script lang="ts">
  import type { File } from "../../logic/Files/File";
  import WebView from "../Shared/WebView.svelte";

  export let file: File;
</script>

<style>
</style>
