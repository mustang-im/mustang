<vbox class="thin-right-side-bar">
  <RoundButton
    onClick={onClosePreview}
    label={$t`Close file`}
    icon={XIcon}
    iconSize="18px"
    padding="4px"
    classes="plain"
    />
  <RoundButton
    onClick={() => $isRightSidebarExpanded = true}
    label={$isRightSidebarExpanded ? $t`Collapse sidebar` : $t`Expand sidebar`}
    icon={$isRightSidebarExpanded ? CollapseIcon : ExpandIcon}
    iconSize="18px"
    padding="4px"
    classes="plain"
    />
  <RoundButton
    onClick={onOpenLocal}
    label={$t`Open in app`}
    tooltip={$t`Open with a local application on your computer`}
    padding="4px"
    classes="plain"
    >
    <FileIcon ext={$file.ext} localFilePath={$file.path} size={20} slot="icon" />
  </RoundButton>
</vbox>

<script lang="ts">
  import type { File } from "../../../logic/Files/File";
  import { viewFile, isRightSidebarExpanded } from "../selected";
  import { startWebApp } from "../../WebApps/Runner/open";
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import FileIcon from "../Thumbnail/FileIcon.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import XIcon from "lucide-svelte/icons/x";
  import ExpandIcon from "lucide-svelte/icons/chevrons-left";
  import CollapseIcon from "lucide-svelte/icons/chevrons-right";
  import { catchErrors, showError } from "../../Util/error";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let file: File;

  let editors: Collection<WebAppListed>;
  $: file && catchErrors(async () => editors = await file.availableOnlineEditors(), showError);

  /** Open native desktop app */
  async function onOpenLocal() {
    await file.openOSApp();
  }
  /** Open web app from cloud provider */
  async function onOpenCloud() {
    assert(editors.hasItems, $t`No online app available for this file type`);
    let webApp = editors.first.instantiate(file.parent?.account);
    startWebApp(webApp);
  }
  function onClosePreview() {
    $viewFile = null;
  }
</script>

<style>
  .thin-right-side-bar {
    align-items: end;
    padding: 8px 4px;
    gap: 8px;
  }
</style>
