<MenuItem
  onClick={getNewMessages}
  label={$t`Get mail`}
  icon={DownloadIcon} />
<!-- <MenuItem
  onClick={openAccountSettings}
  label={$t`Account properties`}
  icon={SettingsIcon} /> -->

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { selectedAccount, selectedFolder } from "../Selected";
  /* Import loop
  import { selectedCategory, selectedAccount as selectedAccountInSettings } from "../../Settings/Window/selected";
  import { accountSettings } from "../../Settings/SettingsCategories";
  import { openApp } from "../../AppsBar/selectedApp";
  import { settingsMustangApp } from "../../Settings/Window/SettingsMustangApp";
  import SettingsIcon from "lucide-svelte/icons/settings"; */
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import DownloadIcon from "lucide-svelte/icons/download";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;

  async function getNewMessages() {
    if (!account.isLoggedIn) {
      await account.login(true);
    }
    await account.inbox.getNewMessages();

    $selectedAccount = account;
    if ($selectedFolder?.account != account) {
      $selectedFolder = account.inbox;
    }
  }

  /* function openAccountSettings() {
    $selectedAccountInSettings = account;
    $selectedCategory = accountSettings.find(cat => account instanceof cat.type && cat.isMain);
    openApp(settingsMustangApp);
  } */
</script>
