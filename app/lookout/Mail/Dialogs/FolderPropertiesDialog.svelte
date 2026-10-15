<Dialog title={$t`${FolderTreeActions.displayName(folder)} Properties`}
  cancelLabel={$t`Close`}
  width="640px"
  on:close>
  <vbox class="dialog-content">
    <hbox class="location">
      <span class="label">{$t`Location:`}</span>
      <span>{folder.account?.name} / {folder.fullPath}</span>
    </hbox>
    <FolderGeneral {folder} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { FolderTreeActions } from "../FolderPane/FolderTreeActions";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import FolderGeneral from "../../../frontend/Settings/Mail/Account/FolderGeneral.svelte";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder;
</script>

<style>
  .dialog-content {
    gap: 16px;
  }
  .location {
    gap: 8px;
    color: var(--lo-fg-secondary);
  }
  .label {
    color: var(--lo-fg);
  }
  .dialog-content :global(input[type="text"]),
  .dialog-content :global(select) {
    height: 30px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
</style>
