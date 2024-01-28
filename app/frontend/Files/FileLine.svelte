<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="file line"
  class:selected={file == $selectedFile}
  on:click={selectThis}>
  <hbox class="firstColumn">
    {#each {length: indent} as _}
      <hbox class="indention" />
    {/each}
    <button class="icon" >
      <FileIcon {file} />
    </button>
    <hbox class="name">
      {file.nameWithoutExt}
    </hbox>
  </hbox>
  <hbox class="type">
    {file.ext}
  </hbox>
  <hbox class="size">
    {fileSize(file.length)}
  </hbox>
  <hbox class="time">
    {getDateString(file.lastMod)}
  </hbox>
</hbox>

<script lang="ts">
  import type { File } from "../../logic/Files/File";
  import { selectedFile } from "./selected";
  import { getDateString } from "../Util/date";
  import FileIcon from "./FileIcon.svelte";
  import prettyBytes from 'pretty-bytes';

  export let file: File;
  export let indent = 0;

  function fileSize(sizeInBytes: number) {
    return prettyBytes(sizeInBytes, {
      binary: true,
      locale: navigator.language,
      maximumFractionDigits: 0,
    })
    .replace("i", "");
  }

  function selectThis() {
    $selectedFile = file;
  }
</script>

<style>
  .line {
    display: contents;
  }
  .line:hover:not(.selected) > * {
    background-color: #A9DAD4;
  }
  .line.selected > * {
    background-color: #20AE9E;
    color: white;
  }
  .name, .type, .size, .time {
    padding-left: 8px;
    padding-right: 8px;
  }
  .icon {
    padding-left: 16px;
    padding-right: 0px;
    margin-top: 2px;
  }
  .icon :global(svg) {
    stroke-width: 1.5px;
  }
  .time {
    padding-right: 16px;
  }
  .icon {
    align-self: center;
    border: none;
    background-color: transparent;
  }
  .indention {
    margin-left: 16px;
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
