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
    label={$t`Expand sidebar`}
    icon={ExpandIcon}
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
  import FileIcon from "../Thumbnail/FileIcon.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import XIcon from "lucide-svelte/icons/x";
  import ExpandIcon from "lucide-svelte/icons/chevrons-left";
  import { t } from "../../../l10n/l10n";

  export let file: File;

  /** Open native desktop app */
  async function onOpenLocal() {
    await file.openOSApp();
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
