<Splitter name="files-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <LeftPane bind:listFiles bind:listDirs bind:activeTab={$selectedLeftTab} />
  </vbox>
  <Splitter name="right-pane"
    initialRightRatio={0.25} rightMinWidth={300}
    slot="right">
    <vbox class="main-pane" slot="left">
      {#if $viewFile}
        <FileViewer file={$viewFile} />
      {:else if listFiles}
        {#if $selectedFolder}
          <FilesHeader dir={$selectedFolder} />
        {/if}
        {#if view == "table"}
          <FilesList files={listFiles} dirs={listDirs} />
        {:else if view == "gallery"}
          <Gallery bind:files={listFiles} bind:dirs={listDirs} />
        {/if}
      {/if}
    </vbox>
    <vbox class="right-side-pane" slot="right">
      {#if $selectedFile instanceof File}
        <FileRightPane file={$selectedFile} />
      {:else if $selectedFile instanceof Directory}
        <DirectoryRightPane dir={$selectedFile} />
      {/if}
    </vbox>
  </Splitter>
</Splitter>

<script lang="ts">
  import { File } from "../../logic/Files/File";
  import { Directory } from "../../logic/Files/Directory";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { selectedFile, selectedFolder, selectedLeftTab, viewFile } from "./selected";
  import LeftPane from "./LeftPane/LeftPane.svelte";
  import FilesList from "./FilesList/FilesList.svelte";
  import Gallery from "./Gallery/Gallery.svelte";
  import FilesHeader from "./MainPane/FilesHeader.svelte";
  import FileViewer from "./FileViewer.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import type { Collection } from "svelte-collections";
  import { catchErrors } from "../Util/error";
  import FileRightPane from "./RightSidePane/FileRightPane.svelte";
  import DirectoryRightPane from "./RightSidePane/DirectoryRightPane.svelte";

  /** The list of files to show on the right pane */
  let listFiles: Collection<File>;
  /** The list of folders to show on the right pane.
   * Must be in the same logical list (e.g. container) as `listFiles`. */
  let listDirs: Collection<Directory>;

  let viewSetting = getLocalStorage("files.view", "table");
  $: view = $viewSetting.value;

  $: listDirs && catchErrors(ls)
  async function ls() {
    await Promise.allSettled(listDirs.contents.map(dir =>
      dir.listContents()));
  }

  // Close FileViewer when selecting another dir or file
  $: $selectedFile, closeViewer();
  $: $selectedFolder, closeViewer();
  function closeViewer() {
    $viewFile = null;
  }
</script>

<style>
  .main-pane {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
</style>
