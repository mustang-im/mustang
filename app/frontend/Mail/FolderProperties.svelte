<HeaderGroupBox>
  <hbox slot="header">{$folder.name}</hbox>
  <hbox slot="buttons-top-right" class="buttons">
    <Button label={$t`Create sub-folder`}
      classes="create"
      iconOnly
      icon={PlusIcon}
      onClick={onCreateFolder}
      disabled={folder.disableSubfolders()}
      />
    <Button label={$t`Delete folder`}
      classes="delete"
      iconOnly
      icon={DeleteIcon}
      onClick={onDelete}
      disabled={$folder.disableDelete()}
      />
  </hbox>
  <FolderGeneral {folder} />
  <FolderActions />
</HeaderGroupBox>

<script lang="ts">
  import type { Folder } from "../../logic/Mail/Folder";
  import { SavedSearchFolder } from "../../logic/Mail/Virtual/SavedSearchFolder";
  import { selectedFolder } from "./Selected";
  import FolderGeneral from "../Settings/Mail/Account/FolderGeneral.svelte";
  import FolderActions from "../Settings/Mail/Account/FolderActions.svelte";
  import HeaderGroupBox from "../Shared/HeaderGroupBox.svelte";
  import Button from "../Shared/Button.svelte";
  import PlusIcon from "lucide-svelte/icons/plus";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ createFolder: void }>();

  export let folder: Folder;

  export function onCreateFolder() {
    dispatchEvent("createFolder");
  }

  async function onDelete() {
    if (!(folder instanceof SavedSearchFolder)) {
      let confirmed = confirm($t`Are you sure that you want to the delete folder ${folder.name} and all messages in it? This will also delete it on the server.`);
      if (!confirmed) {
        return;
      }
    }
    $selectedFolder = folder.parent ?? folder.account.inbox;
    await folder.deleteIt();
  }
</script>

<style>
  .buttons {
    justify-content: end;
  }
  .buttons :global(button) {
    margin-inline-start: 8px;
  }
</style>
