{#if ext == "doc" || ext == "docx" || ext == "odt" || ext == "pdf"}
  <DocIcon {size} />
{:else if ext == "html" || ext == "htm" || ext == "shtml"}
  <HTMLIcon {size} />
{:else if ext == "xls" || ext == "xlsx" || ext == "ods"}
  <SpreadsheetIcon {size} />
{:else if ext == "mp3" || ext == "mp2" || ext == "mp2a" || ext == "m2a" || ext == "m3a" || ext == "mpga" || ext == "wav"}
  <MusicIcon {size} />
{:else if ext == "mpg" || ext == "mpeg" || ext == "mp4v" || ext == "mp4" || ext == "mp2" || ext == "m2v" || ext == "mpg4" || ext == "m1v" || ext == "mpe"}
  <VideoIcon {size} />
{:else if ext == "png" || ext == "gif" || ext == "jpg" || ext == "jpeg" || ext == "svg" || ext == "jpe"}
  <ImageIcon {size} />
{:else}
  <FileIcon {size} />
{/if}

<script lang="ts">
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

  /*
  <svelte:component this={getIcon(file)} {size} />
  function getIcon(file: File) {
    if (ext == "doc" || ext == "docx" || ext == "odt" || ext == "pdf") {
      return DocIcon;
    } else if (ext == "html" || ext == "htm" || ext == "shtml") {
      return HTMLIcon;
    } else if (ext == "xls" || ext == "xlsx" || ext == "ods") {
      return SpreadsheetIcon;
    } else if (ext == "mp3" || ext == "mp2" || ext == "mp2a" || ext == "m2a" || ext == "m3a" || ext == "mpga" || ext == "wav") {
      return MusicIcon;
    } else if (ext == "mpg" || ext == "mpeg" || ext == "mp4v" || ext == "mp4" || ext == "mp2" || ext == "m2v" || ext == "mpg4" || ext == "m1v" || ext == "mpe") {
      return VideoIcon;
    } else if (ext == "png" || ext == "gif" || ext == "jpg" || ext == "jpeg" || ext == "svg" || ext == "jpe") {
      return ImageIcon;
    } else {
      return FileIcon;
    }
  }
  */
</script>
