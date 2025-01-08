<hbox class="folder" flex
  on:drop={(event) => catchErrors(() => onDropMail(event, folder))}
  on:dragover={(event) => catchErrors(() => onDragOverMail(event, folder))}
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
  <hbox class="buttons" flex>
    <GetMailButton {folder} />
    <Button label={$t`Folder properties`} icon={MoreIcon} iconOnly plain
      onClick={onSettings} />
  </hbox>
</hbox>

<script lang="ts">
  import { type Folder, SpecialFolder, specialFolderNames } from '../../../logic/Mail/Folder';
  import { onDropMail, onDragOverMail } from '../Message/drag';
  import GetMailButton from './GetMailButton.svelte';
  import Button from '../../Shared/Button.svelte';
  import FolderIcon from './FolderIcon.svelte';
  import MoreIcon from "lucide-svelte/icons/ellipsis";
  import { catchErrors } from '../../Util/error';
  import { openFolderProperties } from '../FolderPropertiesPage.svelte';
  import { selectedFolder } from '../Selected';
  import { t } from '../../../l10n/l10n';

  export let folder: Folder;

  // $: console.log("FolderLine for folder", folder.name, folder);

  function onSettings() {
    $selectedFolder = folder;
    $openFolderProperties = true;
  }
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
