{#if file instanceof Directory}
  <DirectoryLine directory={file} {indent} />
{:else if file instanceof File }
  <FileLine {file} {indent} />
{:else}
  Unknown object
{/if}

<script lang="ts">
  import { Directory, File, FileOrDirectory } from "../../logic/Files/File";
  import FileLine from "./FileLine.svelte";
  import DirectoryLine from "./DirectoryLine.svelte";

  export let file: FileOrDirectory;
  export let indent = 0;
</script>

<style>
</style>
