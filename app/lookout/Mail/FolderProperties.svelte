<Dialog title={$t`${FolderTreeActions.displayName(folder)} Properties`}
  okLabel={$t`OK`} onOK={onApply}
  onApply={onApply} applyDisabled={!isChanged}
  width="520px"
  on:close>
  <DialogTabs tabs={tabs} bind:selected={tab} />
  {#if tab == FolderPropertiesTab.General}
    <FolderGeneralTab {folder} bind:name bind:specialFolder bind:countMode />
  {:else if tab == FolderPropertiesTab.Permissions && permissions}
    <FolderPermissionsTab bind:permissions onChange={() => { permissionsVersion++; }} />
  {:else if tab == FolderPropertiesTab.Synchronization}
    <FolderSyncTab {folder} />
  {/if}
</Dialog>

<script lang="ts">
  import type { Folder } from "../../logic/Mail/Folder";
  import { FolderCountMode, FolderTreeActions } from "./FolderPane/FolderTreeActions";
  import { FolderPermissions } from "./Dialogs/FolderProperties/FolderPermissions";
  import { FolderPropertiesTab } from "./Dialogs/FolderProperties/FolderPropertiesTab";
  import FolderGeneralTab from "./FolderProperties/FolderGeneralTab.svelte";
  import FolderPermissionsTab from "./FolderProperties/FolderPermissionsTab.svelte";
  import FolderSyncTab from "./FolderProperties/FolderSyncTab.svelte";
  import Dialog from "../Shared/Dialog/Dialog.svelte";
  import DialogTabs from "../Shared/Dialog/DialogTabs.svelte";
  import { assert } from "../../logic/util/util";
  import { gt, t } from "../../l10n/l10n";

  export let folder: Folder;
  export let tab: FolderPropertiesTab = FolderPropertiesTab.General;

  let name = folder.name;
  let specialFolder = folder.specialFolder;
  let initialCountMode = FolderTreeActions.showsTotalCount(folder) ? FolderCountMode.Total : FolderCountMode.Unread;
  let countMode = initialCountMode;
  let permissions = FolderTreeActions.canShare(folder.account) ? new FolderPermissions(folder) : null;
  let permissionsVersion = 0;

  $: tabs = [
    { id: FolderPropertiesTab.General, label: gt`General` },
    ...(permissions ? [{ id: FolderPropertiesTab.Permissions, label: gt`Permissions` }] : []),
    { id: FolderPropertiesTab.Synchronization, label: gt`Synchronization` },
  ];
  $: isChanged = isDirty(name, specialFolder, countMode, permissionsVersion);

  function isDirty(..._dependencies: any[]): boolean {
    return name != folder.name || specialFolder != folder.specialFolder ||
      countMode != initialCountMode || !!permissions?.isChanged;
  }

  async function onApply() {
    let isRenamed = name != folder.name;
    let isSpecialChanged = specialFolder != folder.specialFolder;
    if (isRenamed) {
      assert(name.trim(), gt`Name cannot be empty`);
      await folder.rename(name.trim());
      name = folder.name;
    }
    if (isSpecialChanged) {
      folder.specialFolder = specialFolder;
    }
    if (isRenamed || isSpecialChanged) {
      await folder.save();
    }
    if (countMode != initialCountMode) {
      FolderTreeActions.setCountMode(folder, countMode);
      initialCountMode = countMode;
    }
    if (permissions?.isChanged) {
      await permissions.apply();
      permissions = permissions;
    }
    permissionsVersion++;
  }
</script>
