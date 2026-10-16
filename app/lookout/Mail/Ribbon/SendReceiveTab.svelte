<RibbonTab label={$t`Send / Receive`}>
  <RibbonGroup label={$t`Send & Receive`}>
    <RibbonButton label={$t`Send/Receive All Folders`} icon={SendReceiveIcon}
      onClick={() => MessageActions.sendReceiveAll()}
      disabled={!$accounts.hasItems && $t`Please set up a mail account first`}
      shortCutInfo="F9" />
    <RibbonButton label={$t`Update Folder`} icon={UpdateFolderIcon} size="small"
      tooltip={$t`Get new mail for the current folder`}
      onClick={() => MessageActions.getNewMail(folder)}
      disabled={MessageActions.disableGetNewMail(folder)}
      shortCutInfo="Shift+F9" />
  </RibbonGroup>
  <RibbonGroup label={$t`Server`}>
    <RibbonButton label={$t`Download All Messages`} icon={DownloadAllIcon} size="small"
      tooltip={$t`Download all messages of the current folder, for offline use and search`}
      onClick={() => MessageActions.downloadAll(folder)}
      disabled={!folder && $t`Select a folder first`} />
  </RibbonGroup>
</RibbonTab>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import { appGlobal } from "../../../logic/app";
  import { MessageActions } from "../MessageActions";
  import RibbonTab from "../../Shared/Ribbon/RibbonTab.svelte";
  import RibbonGroup from "../../Shared/Ribbon/RibbonGroup.svelte";
  import RibbonButton from "../../Shared/Ribbon/RibbonButton.svelte";
  import SendReceiveIcon from "lucide-svelte/icons/refresh-cw";
  import UpdateFolderIcon from "lucide-svelte/icons/folder-sync";
  import DownloadAllIcon from "lucide-svelte/icons/hard-drive-download";
  import { t } from "../../../l10n/l10n";

  export let folder: Folder | null = null;

  const accounts = appGlobal.emailAccounts;
</script>
