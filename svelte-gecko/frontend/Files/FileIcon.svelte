{#if file.ext == "doc" || file.ext == "docx" || file.ext == "odt" || file.ext == "pdf"}
  <DocIcon size="16" />
{:else if file.ext == "html" || file.ext == "htm" || file.ext == "shtml"}
  <HTMLIcon size="16" />
{:else if file.ext == "xls" || file.ext == "xlsx" || file.ext == "ods"}
  <SpreadsheetIcon size="16" />
{:else if file.ext == "mp3" || file.ext == "mp2" || file.ext == "mp2a" || file.ext == "m2a" || file.ext == "m3a" || file.ext == "mpga" || file.ext == "wav"}
  <MusicIcon size="16" />
{:else if file.ext == "mpg" || file.ext == "mpeg" || file.ext == "mp4v" || file.ext == "mp4" || file.ext == "mp2" || file.ext == "m2v" || file.ext == "mpg4" || file.ext == "m1v" || file.ext == "mpe"}
  <VideoIcon size="16" />
{:else if file.ext == "png" || file.ext == "gif" || file.ext == "jpg" || file.ext == "jpeg" || file.ext == "svg" || file.ext == "jpe"}
  <ImageIcon size="16" />
{:else}
  <FileIcon size="16" />
{/if}

<script lang="ts">
  import type { File } from "../../logic/Files/File";
  import FileIcon from "lucide-svelte/icons/file";
  import DocIcon from "lucide-svelte/icons/file-text";
  import HTMLIcon from "lucide-svelte/icons/code-2";
  import SpreadsheetIcon from "lucide-svelte/icons/table";
  import MusicIcon from "lucide-svelte/icons/music";
  import ImageIcon from "lucide-svelte/icons/image";
  import VideoIcon from "lucide-svelte/icons/film";

  export let file: File;

  /*
  <svelte:component this={getIcon(file)} size="16" />
  function getIcon(file: File) {
    if (file.ext == "doc" || file.ext == "docx" || file.ext == "odt" || file.ext == "pdf") {
      return DocIcon;
    } else if (file.ext == "html" || file.ext == "htm" || file.ext == "shtml") {
      return HTMLIcon;
    } else if (file.ext == "xls" || file.ext == "xlsx" || file.ext == "ods") {
      return SpreadsheetIcon;
    } else if (file.ext == "mp3" || file.ext == "mp2" || file.ext == "mp2a" || file.ext == "m2a" || file.ext == "m3a" || file.ext == "mpga" || file.ext == "wav") {
      return MusicIcon;
    } else if (file.ext == "mpg" || file.ext == "mpeg" || file.ext == "mp4v" || file.ext == "mp4" || file.ext == "mp2" || file.ext == "m2v" || file.ext == "mpg4" || file.ext == "m1v" || file.ext == "mpe") {
      return VideoIcon;
    } else if (file.ext == "png" || file.ext == "gif" || file.ext == "jpg" || file.ext == "jpeg" || file.ext == "svg" || file.ext == "jpe") {
      return ImageIcon;
    } else {
      return FileIcon;
    }
  }
  */
</script>
