{#if !file.isDownloaded}
  <FileIcon {ext} {size} />
{:else if ext == "html" || ext == "htm" || ext == "shtml" || ext == "txt" || ext == "pdf"}
  <HTMLThumbnail {file} {size} />
{:else if ext == "mp3" || ext == "mp2" || ext == "mp2a" || ext == "m2a" || ext == "m3a" || ext == "mpga" || ext == "wav"}
  <AudioThumbnail {file} {size} />
{:else if ext == "mpg" || ext == "mpeg" || ext == "mp4v" || ext == "mp4" || ext == "mp2" || ext == "m2v" || ext == "mpg4" || ext == "m1v" || ext == "mpe"}
  <VideoThumbnail {file} {size} />
{:else if ext == "png" || ext == "gif" || ext == "jpg" || ext == "jpeg" || ext == "svg" || ext == "jpe"}
  <ImageThumbnail {file} {size} />
{:else}
  <FileIcon {ext} {size} />
{/if}

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import ImageThumbnail from "./ImageThumbnail.svelte";
  import VideoThumbnail from "./VideoThumbnail.svelte";
  import AudioThumbnail from "./AudioThumbnail.svelte";
  import HTMLThumbnail from "./HTMLThumbnail.svelte";
  import FileIcon from "./FileIcon.svelte";

  /** TODO use mimetype */
  export let file: File;
  export let size = 16;

  $: ext = file.ext;
</script>
