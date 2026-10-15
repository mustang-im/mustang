<MenuLabel label={$t`${Math.max($folder.countTotal, $messages.length)} items (${$folder.countUnread} unread)`} />
<MenuItem label={$t`New Folder…`} icon={NewFolderIcon}
  disabled={isVirtual ? $t`Select a folder of an account first` : folder.disableSubfolders()}
  onClick={() => MailDialogs.open({ kind: "new-folder", account: folder.account, parent: folder })} />
<MenuItem label={$t`Rename Folder`} icon={RenameIcon}
  disabled={folder instanceof AllFolders ? $t`You cannot rename this folder` : $folder.disableRename()}
  onClick={() => FolderTreeActions.renaming.set(folder)} />
<MenuItem label={$t`Delete Folder`} icon={DeleteIcon}
  disabled={folder instanceof AllFolders ? $t`You cannot delete this folder` : $folder.disableDelete()}
  onClick={async () => { await FolderTreeActions.deleteFolder(folder); }} />
<MenuDivider />
<MenuItem label={$t`Mark All as Read`} icon={MarkReadIcon}
  disabled={!$folder.countUnread && !isVirtual && $t`There are no unread messages`}
  onClick={() => FolderTreeActions.markAllRead(folder)} />
<MenuItem label={$t`Update Folder`} icon={UpdateIcon}
  onClick={() => MessageActions.getNewMail(folder)} />
<MenuItem label={$t`Download All Messages`} icon={DownloadAllIcon}
  tooltip={$t`Download all messages of this folder, for offline use and search`}
  onClick={() => MessageActions.downloadAll(folder)} />
{#if FolderTreeActions.canDeleteAll(folder)}
  <MenuItem label={$t`Delete All`} icon={DeleteAllIcon} classes="danger"
    disabled={!$folder.countTotal && !$messages.hasItems && $t`The folder is empty`}
    onClick={() => FolderTreeActions.deleteAll(folder)} />
{/if}
{#if !isVirtual}
  <MenuDivider />
  <MenuItem label={$t`Properties…`} icon={PropertiesIcon}
    onClick={() => MailDialogs.open({ kind: "folder-properties", folder })} />
{/if}

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { AllFolders } from "../../../logic/Mail/Virtual/AllFolders";
  import { FolderTreeActions } from "./FolderTreeActions";
  import { MessageActions } from "../MessageActions";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import MenuLabel from "../../../frontend/Shared/Menu/MenuLabel.svelte";
  import MenuDivider from "../../../frontend/Shared/Menu/MenuDivider.svelte";
  import NewFolderIcon from "lucide-svelte/icons/folder-plus";
  import RenameIcon from "lucide-svelte/icons/folder-pen";
  import DeleteIcon from "lucide-svelte/icons/folder-x";
  import MarkReadIcon from "lucide-svelte/icons/mail-open";
  import UpdateIcon from "lucide-svelte/icons/refresh-cw";
  import DownloadAllIcon from "lucide-svelte/icons/hard-drive-download";
  import DeleteAllIcon from "lucide-svelte/icons/trash-2";
  import PropertiesIcon from "lucide-svelte/icons/folder-cog";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder;

  $: isVirtual = FolderTreeActions.isVirtual(folder);
  $: messages = folder.messages;
</script>
