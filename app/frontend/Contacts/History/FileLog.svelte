<vbox class="file" flex
  title={(file.name ?? "") + "\n" + fileSize(file.size)}
  on:click={() => catchErrors(onOpenExternal)}>
  <div class="name">
    {file.name?.substring(0, 200) ?? ""}
  </div>
</vbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { selectedFile } from "../../Files/selected";
  import { openApp } from "../../AppsBar/selectedApp";
  import { filesMustangApp } from "../../Files/FilesMustangApp";
  import { fileSize } from "../../Files/fileSize";
  import { catchErrors } from "../../Util/error";

  export let file: File;

  async function onOpenFilesApp() {
    $selectedFile = file;
    openApp(filesMustangApp);
  }

  async function onOpenExternal() {
    await file.openOSApp();
  }
</script>

<style>
  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 1.4em;
    margin-block-start: -1px;
    margin-block-end: 3px;
    font-weight: bold;
  }
</style>
