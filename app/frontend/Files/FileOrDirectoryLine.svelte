<hbox class="file line"
  class:selected={file == $selectedFile}
  on:click={file instanceof File ? selectThis : toggleOpen}
  >
  <hbox class="firstColumn">
    {#each {length: indent} as _}
      <hbox class="indention" />
    {/each}
    <button class="icon"
      on:click={file instanceof File ? () => catchErrors(openFile) : () => null}
      >
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
    <hbox class="name"
      on:click={file instanceof File ? () => catchErrors(openFile) : () => null}
      >
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
      {$t`Folder`}
    {/if}
  </hbox>
  <hbox class="size">
    {#if file instanceof File}
      {fileSize(file.length)}
    {:else if file instanceof Directory}
      {file.files.length} {$t`entries`}
    {/if}
  </hbox>
  <hbox class="time">
    {getDateTimeString(file.lastMod)}
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
  import { fileSize } from "./fileSize";
  import { selectedFile } from "./selected";
  import { getDateTimeString } from "../Util/date";
  import FileIcon from "./FileIcon.svelte";
  import FolderClosedIcon from "lucide-svelte/icons/folder";
  import FolderOpenIcon from "lucide-svelte/icons/folder-open";
  import { catchErrors } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";

  export let file: FileOrDirectory;
  export let indent = 0;

  function selectThis() {
    $selectedFile = file;
  }

  async function openFile() {
    assert(file instanceof File, "Need file");
    console.log("open", file.filepathLocal);
    await file.openOSApp();
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
