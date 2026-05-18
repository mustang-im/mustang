<Clickable onClick={onOpen}>
  <vbox class="file" flex
    title={(file.name ?? "") + "\n" + fileSize(file.size)}>
    <div class="name">
      {file.name?.substring(0, 200) ?? ""}
    </div>
  </vbox>
</Clickable>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { fileSize } from "../../Files/fileSize";
  import { openFileFromOtherApp } from "../../Files/open";
  import Clickable from "../../Shared/Clickable.svelte";

  export let file: File;

  async function onOpen() {
    await file.openOSApp();
  }

  async function onOpenPreview() {
    openFileFromOtherApp(file);
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
