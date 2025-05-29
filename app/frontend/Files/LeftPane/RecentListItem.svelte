<hbox class="account"
  on:contextmenu={contextMenu.onContextMenu}>
  <hbox class="icon">
    <FileIcon ext={file.ext} size={16} />
  </hbox>
  <hbox class="label">{$file.nameWithoutExt}</hbox>
    <hbox flex class="buttons">
      <Button
        onClick={() => file.openOSApp()}
        icon={OpenExtIcon}
        label={$t`Open in external application`}
        plain iconOnly iconSize="16px"
        />
    </hbox>
</hbox>

<ContextMenu bind:this={contextMenu}>
  <FileMenu {file} />
</ContextMenu>

<script lang="ts">
  import { File } from "../../../logic/Files/File";
  import FileIcon from "../Thumbnail/FileIcon.svelte";
  import FileMenu from "./FileMenu.svelte";
  import ContextMenu from "../../Shared/Menu/ContextMenu.svelte";
  import Button from "../../Shared/Button.svelte";
  import OpenExtIcon from "lucide-svelte/icons/external-link";
  import { t } from "../../../l10n/l10n";

  export let file: File;

  let contextMenu: ContextMenu;
</script>

<style>
  .account {
    align-items: center;
    padding-inline-start: 12px;
    padding-block-start: 2px;
    padding-block-end: 2px;
  }
  .icon {
    height: 20px;
    width: 20px;
    align-items: center;
    justify-content: center;
  }
  .icon :global(path),
  .icon :global(.cls-2) {
    stroke: var(--leftpane-fg);
  }
  .label {
    margin-inline-start: 6px;
    font-weight: 300;
  }
  .account:not(:hover) .buttons {
    display: none;
  }
  .buttons {
    justify-content: end;
    margin-inline-end: 8px;
  }
  .buttons :global(button) {
    color: unset;
    background-color: unset;
    border: none;
  }
  .buttons :global(.get-mail button) {
    padding: 3px;
  }
</style>
