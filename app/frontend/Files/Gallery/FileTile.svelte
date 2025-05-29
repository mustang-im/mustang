<vbox class="file box"
  class:selected={file == $selectedFile}
  on:click={() => catchErrors(openFile)}
  >
  <vbox class="tile">
    <button class="icon">
      <FileIcon ext={file.ext} size={48} />
    </button>
  </vbox>
  <vbox class="info">
    <hbox class="name">
      {file?.name}
    </hbox>
    <hbox class="second">
      <hbox flex />
      <hbox class="time font-smallest">
        {file?.lastMod ? getDateTimeString(file.lastMod) : ""}
      </hbox>
    </hbox>
  </vbox>
</vbox>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import { selectedFile } from "../selected";
  import FileIcon from "../FileIcon.svelte";
  import { getDateTimeString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";
  import { assert } from "../../../logic/util/util";

  export let file: File;

  async function openFile() {
    assert(file instanceof File, "Need file");
    console.log("open", file.filepathLocal);
    await file.download();
    await file.openOSApp();
  }
</script>

<style>
  .box:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .tile {
    align-items: center;
    justify-content: center;
    width: 192px;
    height: 144px;
  }
  .icon {
    align-self: center;
    opacity: 60%;
    border: none;
    background-color: transparent;
    padding-inline-start: 16px;
    padding-inline-end: 0px;
    margin-block-start: 2px;
  }
  .icon :global(svg) {
    stroke-width: 1.5px;
  }
  .info {
    max-width: 176px;
    padding-block: 4px;
    padding-inline: 8px;
  }
  .name, .second {
    max-height: 20px;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  .time {
    padding-inline-end: 16px;
    justify-content: end;
    min-width: 5em;
    opacity: 50%;
    font-weight: 300;
  }
</style>
