<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="firstColumn" on:click={toggleOpen}>
  {#each {length: indent} as _}
    <hbox class="indention" />
  {/each}
  <button class="expander icon" >
    {#if open}
      <Icon data={folderOpen} scale={1} />
    {:else}
      <Icon data={folderClosed} scale={1} />
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

{#if open}
  {#each directory.files.each as file (file.id) }
    <FileOrDirectoryLine {file} indent={indent + 1} />
  {/each}
{/if}

<script lang="ts">
  import type { Directory } from "../../logic/Files/File";
  import FileOrDirectoryLine from "./FileOrDirectoryLine.svelte";
  import Icon from 'svelte-awesome';
  import folderClosed from 'svelte-awesome/icons/folder';
  import folderOpen from 'svelte-awesome/icons/folderOpen';
  import { getDateString } from "../Util/date";

  export let directory: Directory;
  export let indent = 0;

  let open = false;

  function toggleOpen() {
    open = !open;
  }
</script>

<style>
  .icon, .name, .type, .size, .time {
    padding-left: 8px;
    padding-right: 8px;
  }
  .icon {
    padding-left: 16px;
  }
  .time {
    padding-right: 16px;
  }
  .icon {
    border: none;
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
</style>
