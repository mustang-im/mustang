{#if ["html", "htm", "shtml"].includes(ext)}
  <HTMLIcon {size} />
{:else if ["xls", "xlsx", "ods"].includes(ext)}
  <SpreadsheetIcon {size} />
{:else if ["doc", "docx", "odt", "pdf"].includes(ext) || fileExtensions[ext]?.startsWith("text/")}
  <DocIcon {size} />
{:else if kImageExt.includes(ext) || fileExtensions[ext]?.startsWith("image/")}
  <ImageIcon {size} />
{:else if kVideoExt.includes(ext) || fileExtensions[ext]?.startsWith("video/")}
  <VideoIcon {size} />
{:else if kAudioExt.includes(ext) || fileExtensions[ext]?.startsWith("audio/")}
  <MusicIcon {size} />
{:else}
  <FileIcon {size} />
  <!--<hbox style:width={size}>📄</hbox>-->
{/if}

<script lang="ts">
  import { fileExtensions } from "../../../logic/Files/FileType/MIMETypes";
  import { kSupportedExt as kImageExt } from "./ImageThumbnail.svelte";
  import { kSupportedExt as kVideoExt } from "./VideoThumbnail.svelte";
  import { kSupportedExt as kAudioExt } from "./AudioThumbnail.svelte";
  import FileIcon from "lucide-svelte/icons/file";
  import DocIcon from "lucide-svelte/icons/file-text";
  import HTMLIcon from "lucide-svelte/icons/code-xml";
  import SpreadsheetIcon from "lucide-svelte/icons/table";
  import MusicIcon from "lucide-svelte/icons/music";
  import ImageIcon from "lucide-svelte/icons/image";
  import VideoIcon from "lucide-svelte/icons/film";

  /** TODO use mimetype */
  export let ext: string;
  export let size = 16;
</script>
