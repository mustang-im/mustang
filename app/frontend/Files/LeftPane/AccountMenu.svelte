<MenuItem
  onClick={sync}
  label={$t`Sync`}
  icon={SyncIcon} />

<script lang="ts">
  import type { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import MenuItem from "../../Shared/Menu/MenuItem.svelte";
  import SyncIcon from "lucide-svelte/icons/folder-sync";
  import { t } from "../../../l10n/l10n";

  export let account: FileSharingAccount;

  async function sync() {
    if (!account.isLoggedIn) {
      await account.login(true);
    }
    await account.sync();
  }
</script>
