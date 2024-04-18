<hbox class="folder" on:drop={(event) => catchErrors(() => onDropMail(event, folder))} on:dragover={(event) => catchErrors(() => onDragOverMail(event, folder))}>
  <hbox class="icon">
    <FolderIcon {folder} size="14px" />
  </hbox>
  <hbox class="label">{$folder.name}</hbox>
  <hbox class="buttons" flex>
    <Button label="Folder properties" icon={MoreIcon} iconOnly plain
      on:click={() => catchErrors(() => onSettings())} />
  </hbox>
</hbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import { onDropMail, onDragOverMail } from '../Message/drag';
  import FolderIcon from './FolderIcon.svelte';
  import Button from '../../Shared/Button.svelte';
  import MoreIcon from "lucide-svelte/icons/ellipsis";
  import { catchErrors } from '../../Util/error';
  import { openFolderProperties } from '../FolderProperties.svelte';
  import { selectedFolder } from '../Selected';

  export let folder: Folder;

  function onSettings() {
    $selectedFolder = folder;
    $openFolderProperties = true;
  }
</script>

<style>
  .folder {
    align-items: center;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    padding-left: 8px;
  }
  .buttons {
    justify-content: end;
  }
  .folder:not(:hover) .buttons {
    display: none;
  }
  .buttons :global(button:hover) {
    background: inherit !important;
  }
</style>
