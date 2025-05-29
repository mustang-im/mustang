<vbox class="directory box"
  class:selected={dir == $selectedFile}
  on:click={() => catchErrors(toggleOpen)}
  >
  <vbox class="tile">
    <button class="icon">
      {#if open}
        <FolderOpenIcon size="48" />
      {:else}
        <FolderClosedIcon size="48" />
      {/if}
    </button>
  </vbox>
  <vbox class="info">
    <hbox class="name">
      {dir?.name}
    </hbox>
    <hbox class="second">
      <hbox flex />
      <hbox class="time font-smallest">
        {dir?.lastMod ? getDateTimeString(dir.lastMod) : ""}
      </hbox>
    </hbox>
  </vbox>
</vbox>

<script lang="ts">
  import { Directory } from "../../../logic/Files/Directory";
  import { selectedFolder, selectedFile } from "../selected";
  import FolderClosedIcon from "lucide-svelte/icons/folder";
  import FolderOpenIcon from "lucide-svelte/icons/folder-open";
  import { getDateTimeString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";

  export let dir: Directory;

  function toggleOpen() {
    $selectedFolder = dir;
    dir.listContents()
      .catch(console.error);
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
  }
  .time {
    padding-inline-end: 16px;
    justify-content: end;
    min-width: 5em;
    opacity: 50%;
    font-weight: 300;
  }
</style>
