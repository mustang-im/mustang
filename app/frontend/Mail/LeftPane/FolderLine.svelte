<hbox class="folder" on:drop={(event) => catchErrors(() => onDropMail(event, folder))} on:dragover={(event) => catchErrors(() => onDragOverMail(event, folder))}>
  <hbox class="icon">
    <FolderIcon {folder} size="14px" />
  </hbox>
  <hbox class="label">{$folder.name}</hbox>
</hbox>

<script lang="ts">
  import type { Folder } from '../../../logic/Mail/Folder';
  import { onDropMail, onDragOverMail } from '../Message/drag';
  import FolderIcon from './FolderIcon.svelte';
  import { catchErrors } from '../../Util/error';

  export let folder: Folder;
</script>

<style>
  .folder {
    align-items: center;
    padding-left: 12px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    padding-left: 8px;
  }
</style>
