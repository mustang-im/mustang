<Menu position="bottom" placement="end">
  <hbox class="button" slot="control">
    <DotsIcon size={16} />
  </hbox>
  <Menu.Item
    on:click={() => catchErrors(() => openExternal())}
    title={$t`Open in external application`}
    icon={OpenIcon}>
    {$t`Open in external app`}
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => openFolder())}
    title={$t`Open containing folder`}
    icon={FolderIcon}>
    {$t`Open folder`}
  </Menu.Item>
  <!--
  <Menu.Item
    on:click={() => catchErrors(() => saveFile())}
    title="Save as"
    icon={SaveIcon}>
    Save as
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => deleteIt())}
    title="Delete"
    icon={DeleteIcon}>
    Delete this attachment
  </Menu.Item>
  -->
</Menu>

<script lang="ts">
  import type { Attachment } from "../../../logic/Abstract/Attachment";
  import { Menu } from "@svelteuidev/core";
  import DotsIcon from "lucide-svelte/icons/ellipsis";
  import OpenIcon from "lucide-svelte/icons/external-link";
  import FolderIcon from "lucide-svelte/icons/folder";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { catchErrors } from "../../Util/error";
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
