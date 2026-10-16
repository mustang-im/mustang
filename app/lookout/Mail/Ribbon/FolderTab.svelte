<RibbonTab label={$t`Folder`}>
  <RibbonGroup label={$t`New`}>
    <RibbonButton label={$t`New Folder`} icon={NewFolderIcon}
      onClick={onNewFolder}
      disabled={!realAccount ? $t`Select a folder of an account first` : folder && !isVirtual && folder.disableSubfolders()}
      shortCutInfo="Ctrl+Shift+E" />
    <RibbonButton label={$t`New Search Folder`} icon={NewSearchFolderIcon}
      onClick={() => MailDialogs.open({ kind: "new-search-folder", account: realAccount })}
      shortCutInfo="Ctrl+Shift+P" />
  </RibbonGroup>
  <RibbonGroup label={$t`Actions`}>
    <RibbonButton label={$t`Rename Folder`} icon={RenameIcon} size="small"
      onClick={() => FolderTreeActions.renaming.set(folder)}
      disabled={!folder ? $t`Select a folder first` : folder instanceof AllFolders ? $t`You cannot rename this folder` : $folderStore?.disableRename()} />
    <RibbonButton label={$t`Delete Folder`} icon={DeleteFolderIcon} size="small"
      onClick={async () => { await FolderTreeActions.deleteFolder(folder); }}
      disabled={!folder ? $t`Select a folder first` : folder instanceof AllFolders ? $t`You cannot delete this folder` : $folderStore?.disableDelete()} />
  </RibbonGroup>
  <RibbonGroup label={$t`Clean Up`}>
    <RibbonButton label={$t`Mark All as Read`} icon={MarkAllReadIcon}
      onClick={() => FolderTreeActions.markAllRead(folder)}
      disabled={!folder && $t`Select a folder first`} />
    <RibbonButton label={$t`Delete All`} icon={DeleteAllIcon} size="small"
      tooltip={$t`Permanently delete all messages in this folder`}
      onClick={() => FolderTreeActions.deleteAll(folder)}
      disabled={!(folder && FolderTreeActions.canDeleteAll(folder)) && $t`Only available in the Trash and Junk folders`} />
  </RibbonGroup>
  <RibbonGroup label={$t`Properties`}>
    <RibbonButton label={$t`Folder Permissions`} icon={PermissionsIcon}
      onClick={() => MailDialogs.open({ kind: "folder-permissions", account: realAccount })}
      disabled={!realAccount
        ? $t`Select a folder of an account first`
        : !FolderTreeActions.canShare(realAccount) && $t`This account cannot share folders with colleagues`} />
    <RibbonButton label={$t`Folder Properties`} icon={PropertiesIcon}
      onClick={() => MailDialogs.open({ kind: "folder-properties", folder })}
      disabled={!folder ? $t`Select a folder first` : isVirtual && $t`This is not a real folder`} />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { AllFolders } from "../../../logic/Mail/Virtual/AllFolders";
  import { appGlobal } from "../../../logic/app";
  import { FolderTreeActions } from "../FolderPane/FolderTreeActions";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import NewFolderIcon from "lucide-svelte/icons/folder-plus";
  import NewSearchFolderIcon from "lucide-svelte/icons/folder-search";
  import RenameIcon from "lucide-svelte/icons/folder-pen";
  import DeleteFolderIcon from "lucide-svelte/icons/folder-x";
  import MarkAllReadIcon from "lucide-svelte/icons/mail-check";
  import DeleteAllIcon from "lucide-svelte/icons/trash-2";
  import PropertiesIcon from "lucide-svelte/icons/folder-cog";
  import PermissionsIcon from "lucide-svelte/icons/folder-key";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder | null = null;
  export let account: MailAccount | null = null;

  $: folderStore = folder;
  $: isVirtual = folder && FolderTreeActions.isVirtual(folder);
  $: realAccount = folder && !isVirtual
    ? folder.account
    : account && appGlobal.emailAccounts.contains(account) ? account : null;

  function onNewFolder() {
    MailDialogs.open({ kind: "new-folder", account: realAccount, parent: folder && !isVirtual ? folder : null });
  }
</script>
