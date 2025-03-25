<ButtonMenu>
  <MenuItem
    onClick={openExternal}
    label={$t`Open in external app`}
    tooltip={$t`Open in external application`}
    icon={OpenIcon} />
  <MenuItem
    onClick={openFolder}
    label={$t`Open folder`}
    tooltip={$t`Open containing folder`}
    icon={FolderIcon} />
  <!--
  <MenuItem
    on:click={saveFile}
    label=$t`Save as`
    tooltip=$t`Save as`
    icon={SaveIcon}>
  <MenuItem
    on:click={deleteIt}
    label=$t`Delete this attachment`
    tooltip=$t`Delete`
    icon={DeleteIcon} />
  -->
</ButtonMenu>

<script lang="ts">
  import type { Attachment } from "../../../logic/Abstract/Attachment";
  import ButtonMenu from "../../Shared/Menu/ButtonMenu.svelte";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import OpenIcon from "lucide-svelte/icons/external-link";
  import FolderIcon from "lucide-svelte/icons/folder";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { t } from "../../../l10n/l10n";

  export let attachment: Attachment;

  async function openExternal() {
    await attachment.openOSApp();
  }
  async function openFolder() {
    await attachment.openOSFolder();
  }
  async function saveFile() {
    await attachment.saveFile();
  }
  async function deleteIt() {
    await attachment.deleteFile();
  }
</script>
