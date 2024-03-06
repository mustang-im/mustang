<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="file line"
  class:selected={file == $selectedFile}
  on:click={file instanceof File ? selectThis : toggleOpen}>
  <hbox class="firstColumn">
    {#each {length: indent} as _}
      <hbox class="indention" />
    {/each}
    <button class="icon" >
      {#if file instanceof File}
        <FileIcon ext={file.ext} />
      {:else if file instanceof Directory}
        {#if open}
          <FolderOpenIcon size="16" />
        {:else}
          <FolderClosedIcon size="16" />
        {/if}
      {/if}
    </button>
    <hbox class="name">
      {#if file instanceof File}
        {file.nameWithoutExt}
      {:else if file instanceof Directory}
        {file.name}
      {/if}
    </hbox>
  </hbox>
  <hbox class="type">
    {#if file instanceof File}
      {file.ext}
    {:else if file instanceof Directory}
      Folder
    {/if}
  </hbox>
  <hbox class="size">
    {#if file instanceof File}
      {fileSize(file.length)}
    {:else if file instanceof Directory}
      {file.files.length} entries
    {/if}
  </hbox>
  <hbox class="time">
    {getDateString(file.lastMod)}
  </hbox>
</hbox>

{#if file instanceof Directory}
  {#if open}
    {#each file.files.each as subFile (subFile.id) }
      <svelte:self file={subFile} indent={indent + 1} />
    {/each}
  {/if}
{/if}

<script lang="ts">
  import { File, Directory, FileOrDirectory } from "../../logic/Files/File";
  import { selectedFile } from "./selected";
  import { getDateString } from "../Util/date";
  import FileIcon from "./FileIcon.svelte";
  import FolderClosedIcon from "lucide-svelte/icons/folder";
  import FolderOpenIcon from "lucide-svelte/icons/folder-open";
  import prettyBytes from 'pretty-bytes';

  export let file: FileOrDirectory;
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

  let open = false;

  function toggleOpen() {
    open = !open;
    selectThis();
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
