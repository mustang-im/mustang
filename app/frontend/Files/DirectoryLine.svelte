  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <hbox class="file line"
  class:selected={directory == $selectedFile}
  on:click={toggleOpen}>
  <hbox class="firstColumn">
    {#each {length: indent} as _}
      <hbox class="indention" />
    {/each}
    <button class="expander icon" >
      {#if open}
        <FolderOpenIcon size="16" />
      {:else}
      <FolderClosedIcon size="16" />
      {/if}
    </button>
    <hbox class="name">
      {directory.name}
    </hbox>
  </hbox>
  <hbox class="type">
    Folder
  </hbox>
  <hbox class="size">
    {directory.files.length} entries
  </hbox>
  <hbox class="time">
    {getDateString(directory.lastMod)}
  </hbox>
</hbox>

{#if open}
  {#each directory.files.each as file (file.id) }
    <FileOrDirectoryLine {file} indent={indent + 1} />
  {/each}
{/if}

<script lang="ts">
  import type { Directory } from "../../logic/Files/File";
  import { selectedFile } from "./selected";
  import { getDateString } from "../Util/date";
  import FileOrDirectoryLine from "./FileOrDirectoryLine.svelte";
  import FolderClosedIcon from "lucide-svelte/icons/folder";
  import FolderOpenIcon from "lucide-svelte/icons/folder-open";

  export let directory: Directory;
  export let indent = 0;

  let open = false;

  function toggleOpen(event: Event) {
    open = !open;
    $selectedFile = directory;
    event.stopPropagation();
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
  .time {
    padding-right: 16px;
  }
  .icon {
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
