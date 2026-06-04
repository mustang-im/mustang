{#if !$file.isDownloaded}
  <FileIcon {ext} localFilePath={$file.path} {size} />
{:else if $file.url && kHTMLExt.includes(ext)}
  <HTMLThumbnail {file} />
{:else if $file.url && kAudioExt.includes(ext)}
  <AudioThumbnail {file} />
{:else if $file.url && kVideoExt.includes(ext)}
  <VideoThumbnail {file} />
{:else if $file.url && kImageExt.includes(ext)}
  <ImageThumbnail {file} />
{:else}
  <FileIcon {ext} localFilePath={$file.path} {size} />
{/if}

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import ImageThumbnail, { kSupportedExt as kImageExt} from "./ImageThumbnail.svelte";
  import VideoThumbnail, { kSupportedExt as kVideoExt} from "./VideoThumbnail.svelte";
  import AudioThumbnail, { kSupportedExt as kAudioExt} from "./AudioThumbnail.svelte";
  import HTMLThumbnail, { kSupportedExt as kHTMLExt} from "./HTMLThumbnail.svelte";
  import FileIcon from "./FileIcon.svelte";

  /** TODO use mimetype */
  export let file: File;
  export let size = 16;

  $: ext = file.ext;
</script>
