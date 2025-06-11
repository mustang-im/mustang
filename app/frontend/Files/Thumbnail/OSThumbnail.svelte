{#if $file.isDownloaded}
  {#await getThumbnail(file.path)}
      <FileIcon ext={file.ext} localFilePath={file.path} {size} />
    {:then}
      {#if imageURL}
        <img src={imageURL} width={size} height={size} alt="" />
      {:else}
        <FileIcon ext={file.ext} localFilePath={file.path} {size} />
      {/if}
    {/await}
{:else}
  <FileIcon ext={file.ext} localFilePath={file.path} {size} />
{/if}

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { appGlobal } from "../../../logic/app";
  import FileIcon from "./FileIcon.svelte";

  /** TODO use mimetype */
  export let file: File;
  export let size = 256;

  let imageURL: string = null;

  async function getThumbnail(path: string) {
    imageURL = null;
    imageURL = await appGlobal.remoteApp.getThumbnailForLocalFile(path);
    console.log("thumbnail for", file.path, "is", imageURL);
  }
</script>
