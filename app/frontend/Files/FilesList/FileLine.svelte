<hbox class="file line"
  class:selected={file == $selectedFile}
  on:click={() => catchErrors(openFile)}
  >
  <hbox class="firstColumn">
    {#each {length: indent} as _}
      <hbox class="indention" />
    {/each}
    <button class="icon">
      <DynamicFileIcon ext={file.ext} localFilePath={file.path} />
    </button>
    <hbox class="name">
      {file.nameWithoutExt}
    </hbox>
  </hbox>
  <hbox class="type">
    {file.ext}
  </hbox>
  <hbox class="size">
    {fileSize(file.size)}
  </hbox>
  <hbox class="time">
    {getDateTimeString(file.lastMod)}
  </hbox>
</hbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { fileSize } from "../fileSize";
  import { selectedFile } from "../selected";
  import { getDateTimeString } from "../../Util/date";
  import DynamicFileIcon from "../Thumbnail/DynamicFileIcon.svelte";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";

  export let file: File;
  export let indent = 0;

  async function openFile() {
    assert(file instanceof File, "Need file");
    console.log("open", file.filepathLocal);
    await file.download();
    await file.openOSApp();
  }
</script>

<style>
  .line {
    display: contents;
  }
  .line:hover:not(.selected) > * {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .line.selected > * {
    background-color: var(--selected-bg);
    color: var(--selected-fg);
  }
  .name, .type, .size, .time {
    padding-inline-start: 8px;
    padding-inline-end: 8px;
  }
  .icon {
    padding-inline-start: 16px;
    padding-inline-end: 0px;
    margin-block-start: 2px;
  }
  .icon :global(svg) {
    stroke-width: 1.5px;
  }
  .time {
    padding-inline-end: 16px;
  }
  .icon {
    align-self: center;
    border: none;
    background-color: transparent;
  }
  .indention {
    margin-inline-start: 16px;
  }
  .type {
    min-width: 3.5em;
  }
  .size {
    justify-content: end;
    min-width: 8em;
  }
  .time {
    justify-content: end;
    min-width: 5em;
  }
  .type, .size, .time {
    color: #91939D;
    font-size: 90%;
    font-weight: 300;
  }
</style>
