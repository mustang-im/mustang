<Menu position="bottom" placement="end">
  <hbox class="button" slot="control">
    <DotsIcon size={16} />
  </hbox>
  <Menu.Item
    on:click={() => catchErrors(() => openExternal())}
    title="Open in external application"
    icon={OpenIcon}>
    Open in external app
  </Menu.Item>
  <Menu.Item
    on:click={() => catchErrors(() => openFolder())}
    title="Open containing folder"
    icon={FolderIcon}>
    Open folder
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
  import type { Attachment } from "../../../logic/Mail/Attachment";
  import { appGlobal } from "../../../logic/app";
  import { Menu } from "@svelteuidev/core";
  import DotsIcon from "lucide-svelte/icons/ellipsis";
  import OpenIcon from "lucide-svelte/icons/external-link";
  import FolderIcon from "lucide-svelte/icons/folder";
  import SaveIcon from "lucide-svelte/icons/save";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { catchErrors } from "../../Util/error";
  import { assert, NotImplemented } from "../../../logic/util/util";
  import { saveBlobAsFile, saveURLAsFile } from "../../Util/util";

  export let attachment: Attachment;

  async function openExternal() {
    await appGlobal.remoteApp.openFileInExternalApp(attachment.filepathLocal);
  }
  async function openFolder() {
    let dir = await appGlobal.remoteApp.path.dirname(attachment.filepathLocal);
    assert(dir, "Attachments were not downloaded and saved yet");
    await appGlobal.remoteApp.openFileInExternalApp(dir);
  }
  async function saveFile() {
    let url = "file://" + attachment.filepathLocal;
    alert("url " + url);
    saveURLAsFile(url, attachment.filename);
  }
  async function deleteIt() {
    throw new NotImplemented();
  }
</script>
