<MenuItem
  onClick={getNewMessages}
  label={$t`Get mail`}
  icon={DownloadIcon} />
<MenuItem
  onClick={openSettings}
  label={$t`Account settings`}
  icon={SettingsIcon} />
<MenuItem
  onClick={logOut}
  label={$t`Log out`}
  icon={DisconnectIcon} />

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { getMailSelection } from "../Selected";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import DownloadIcon from "lucide-svelte/icons/download";
  import SettingsIcon from "lucide-svelte/icons/settings";
  import DisconnectIcon from "lucide-svelte/icons/unplug";
  import { t } from "../../../l10n/l10n";
  import { AppWindow } from "../../MainWindow/AppWindow";

  const { selectedAccount, selectedFolder } = getMailSelection();
  const appWindow = AppWindow.current();

  export let account: MailAccount;

  async function getNewMessages() {
    if (!account.isLoggedIn) {
      await account.loginAndStartup(true);
    }
    await account.inbox.getNewMessages();

    $selectedAccount = account;
    if ($selectedFolder?.account != account) {
      $selectedFolder = account.inbox;
    }
  }

  async function openSettings() {
    const { openSettingsCategoryForAccount } = await import("../../Settings/Window/CategoriesUtils"); // break circular dependency
    openSettingsCategoryForAccount(account, appWindow);
  }

  async function logOut() {
    await account.logout();
  }
</script>
