<vbox class="folder-pane-minimized">
  <button class="expand" on:click={onExpand}
    title={$t`Expand the Folder Pane`} aria-label={$t`Expand the Folder Pane`}>
    <ExpandIcon size={16} />
  </button>
  <button class="folder-name" on:click={onExpand} title={$t`Expand the Folder Pane`}>
    {folder ? FolderTreeActions.displayName(folder) : ""}
  </button>
</vbox>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { FolderPaneMode, MailView } from "../MailView";
  import { FolderTreeActions } from "./FolderTreeActions";
  import ExpandIcon from "lucide-svelte/icons/chevron-right";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder | null;

  function onExpand() {
    MailView.folderPane.value = FolderPaneMode.Normal;
  }
</script>

<style>
  .folder-pane-minimized {
    flex-shrink: 0;
    align-items: center;
    width: 36px;
    padding: 0 0 8px 4px;
  }
  .expand {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .expand:hover,
  .folder-name:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .folder-name {
    margin-block-start: 8px;
    padding: 8px 4px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-weight: 600;
    writing-mode: vertical-rl;
    white-space: nowrap;
    cursor: pointer;
  }
</style>
