<MenuItem label={$t`New Folder…`} icon={NewFolderIcon}
  onClick={() => MailDialogs.open({ kind: "new-folder", account, parent: null })} />
<MenuDivider />
<MenuItem label={$t`Update Folder`} icon={UpdateIcon}
  tooltip={$t`Get new mail for this account`}
  onClick={onGetNewMail} />
{#if FolderTreeActions.canShare(account)}
  <MenuItem label={$t`Open Shared Folder…`} icon={SharedFolderIcon}
    tooltip={$t`Open the folders that colleagues shared with you`}
    onClick={() => MailDialogs.open({ kind: "shared-folder", account })} />
{/if}
<MenuItem label={$t`Manage Rules & Alerts…`} icon={RulesIcon}
  onClick={() => MessageActions.openRules(account)} />
<MenuDivider />
<MenuItem label={$t`Account Properties…`} icon={SettingsIcon}
  onClick={() => SettingsDialogs.open({ kind: "change-account", account, page: "general" })} />
{#if $account.isLoggedIn}
  <MenuItem label={$t`Disconnect`} icon={DisconnectIcon}
    tooltip={$t`Log out of this account`}
    onClick={() => account.logout()} />
{:else}
  <MenuItem label={$t`Connect`} icon={ConnectIcon}
    onClick={() => account.loginAndStartup(true)} />
{/if}

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { selectedAccount, selectedFolder } from "../../../frontend/Mail/Selected";
  import { SettingsDialogs } from "../../Settings/SettingsDialogs";
  import { MessageActions } from "../MessageActions";
  import { MailDialogs } from "../Dialogs/MailDialogs";
  import { FolderTreeActions } from "./FolderTreeActions";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import MenuDivider from "../../Shared/Menu/MenuDivider.svelte";
  import UpdateIcon from "lucide-svelte/icons/refresh-cw";
  import NewFolderIcon from "lucide-svelte/icons/folder-plus";
  import RulesIcon from "lucide-svelte/icons/list-filter";
  import SharedFolderIcon from "lucide-svelte/icons/folder-open-dot";
  import SettingsIcon from "lucide-svelte/icons/settings";
  import DisconnectIcon from "lucide-svelte/icons/unplug";
  import ConnectIcon from "lucide-svelte/icons/plug";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  async function onGetNewMail() {
    // <copied from="../../../frontend/Mail/LeftPane/AccountMenu.svelte">
    if (!account.isLoggedIn) {
      await account.loginAndStartup(true);
    }
    await account.inbox.getNewMessages();

    $selectedAccount = account;
    if ($selectedFolder?.account != account) {
      $selectedFolder = account.inbox;
    }
    // </copied>
  }
</script>
