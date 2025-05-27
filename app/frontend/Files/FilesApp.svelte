<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <LeftPane {listFiles} bind:viewFile />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if viewFile}
      <FileViewer file={viewFile} />
    {:else if listFiles}
      <FilesList files={listFiles} />
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import { File } from "../../logic/Files/File";
  import { FileOrDirectory } from "../../logic/Files/FileOrDirectory";
  import LeftPane from "./LeftPane/LeftPane.svelte";
  import FilesList from "./FilesList/FilesList.svelte";
  import FileViewer from "./FileViewer.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { ArrayColl } from "svelte-collections";

  /** The list of files and folders to show on the right pane */
  let listFiles = new ArrayColl<FileOrDirectory>();
  /** If set, this file will be display on the right pane, full page
   * For viewing images and PDFs. Most other file types are not supported. */
  let viewFile: File | null = null;
</script>

<style>
  .right-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
