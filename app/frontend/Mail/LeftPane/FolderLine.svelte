<hbox class="folder" flex
  on:drop={(event) => catchErrors(() => onDropMail(event, folder))}
  on:dragover={(event) => catchErrors(() => onDragOverMail(event, folder))}
  title={tooltip}
  >
  <hbox class="icon">
    <FolderIcon {folder} size="14px" />
  </hbox>
  <hbox class="label">
    {#if !folder.specialFolder || folder.specialFolder == SpecialFolder.Normal}
      {$folder.name}
    {:else}
      {specialFolderNames[folder.specialFolder]}
    {/if}
  </hbox>
  <hbox flex />
  {#if $folder.countNewArrived}
    <hbox class="count">
      {$folder.countNewArrived}
    </hbox>
  {/if}
  <hbox class="buttons">
    <slot name="buttons" {folder} />
  </hbox>
</hbox>

<script lang="ts">
  import { type Folder, SpecialFolder, specialFolderNames } from '../../../logic/Mail/Folder';
  import { onDropMail, onDragOverMail } from '../Message/drag';
  import FolderIcon from './FolderIcon.svelte';
  import { catchErrors } from '../../Util/error';
  import { gt } from '../../../l10n/l10n';

  export let folder: Folder;

  $: tooltip = gt`${folder.name}\n\n${$folder.countNewArrived} new, ${folder.countUnread} unread, ${folder.countTotal} total`;
</script>

<style>
  .folder {
    align-items: center;
    padding-block-start: 2px;
    padding-block-end: 2px;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    padding-inline-start: 8px;
  }
  .count {
    background-color: var(--headerbar-bg);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding-inline: 4px;
    margin-inline-end: 8px;
  }
  .folder:hover .count {
    display: none;
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
  .buttons :global(button) {
    color: unset;
    background-color: unset;
  }
  .buttons :global(.get-mail button) {
    padding: 3px;
    border: 1px solid transparent;
  }
</style>
