<vbox class="right-side-bar" flex>
  <vbox class="preview">
    {#if $viewFile}
      <vbox class="thin-right-side-bar" flex>
        <RoundButton
          onClick={onClosePreview}
          label={$t`Close file`}
          icon={XIcon}
          iconSize="18px"
          padding="4px"
          classes="plain"
          />
        <RoundButton
          onClick={() => $isRightSidebarExpanded = false}
          label={$t`Collapse sidebar`}
          icon={CollapseIcon}
          iconSize="18px"
          padding="4px"
          classes="plain"
          />
      </vbox>
    {:else if canPreview}
      <Thumbnail {file} size={200} />
      <hbox class="open-preview buttons">
        <RoundButton
          onClick={onOpenPreview}
          icon={OpenPreviewIcon}
          />
      </hbox>
    {/if}
  </vbox>
  <vbox class="content" flex>
    <hbox class="open buttons">
      <Button
        onClick={onOpenLocal}
        label={$t`Open`}
        label-should={$t`Open with ${"PhotoShop"}`}
        tooltip={$t`Open with a local application on your computer`}
        >
        <FileIcon ext={$file.ext} localFilePath={$file.path} size={20} slot="icon" />
      </Button>
      <!--
      <RoundButton
        onClick={onOpenCloud}
        icon={OpenCloudIcon}
        label={$t`Open with a cloud app on the web`}
        disabled={!editors || editors.isEmpty ? $t`${file.account.name} does not offer a cloud app for this file type` : null}
        iconSize="24px"
        padding="8px"
        classes="secondary"
        />
      -->
    </hbox>

    <ErrorMessageInline bind:this={error} />

    <Rename {file} />

    <hbox class="file-properties font-small">
      <hbox class="lastMod">{getDateTimeString($file.lastMod)}</hbox>
      <hbox flex />
      <hbox class="size">{fileSize($file.size)}</hbox>
    </hbox>

    <ActionToolbar {file} />
  </vbox>
</vbox>

<script lang="ts">
  import type { File } from "../../../logic/Files/File";
  import { fileSize, openFileInCloudApp } from "../file";
  import { isRightSidebarExpanded, viewFile } from "../selected";
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { kSupportedExt as kHTMLExt } from "../Thumbnail/HTMLThumbnail.svelte";
  import { kSupportedExt as kImageExt } from "../Thumbnail/ImageThumbnail.svelte";
  import { kSupportedExt as kVideoExt } from "../Thumbnail/VideoThumbnail.svelte";
  import { kSupportedExt as kAudioExt } from "../Thumbnail/AudioThumbnail.svelte";
  import Rename from "./Rename.svelte";
  import ActionToolbar from "./ActionToolbar.svelte";
  import Thumbnail from "../Thumbnail/Thumbnail.svelte";
  import FileIcon from "../Thumbnail/FileIcon.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import Button from "../../Shared/Button.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import OpenPreviewIcon from "lucide-svelte/icons/expand";
  import CollapseIcon from "lucide-svelte/icons/chevrons-right";
  import XIcon from "lucide-svelte/icons/x";
  import { getDateTimeString } from "../../Util/date";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let file: File;

  let error: ErrorMessageInline;

  let editors: Collection<WebAppListed>;
  $: error && file && catchErrors(async () => editors = await file.availableOnlineEditors(), error.showError);
  $: error && file && catchErrors(async () => await file.getURL(), error.showError);

  const kPreviewExt = [...kHTMLExt, ...kImageExt, ...kVideoExt, ...kAudioExt];
  $: canPreview = kPreviewExt.includes($file.ext);

  /** Open native desktop app */
  async function onOpenLocal() {
    await file.openOSApp();
  }
  /** Open web app from cloud provider */
  async function onOpenCloud() {
    await openFileInCloudApp(file);
  }
  function onOpenPreview() {
    $viewFile = file;
  }
  function onClosePreview() {
    $viewFile = null;
  }
</script>

<style>
  .right-side-bar {
    box-shadow: -2px 0px 3px 1px #e3e3e3;
  }
  .thin-right-side-bar {
    align-items: end;
    padding: 8px 4px;
    gap: 8px;
  }
  .content {
    align-items: stretch;
    padding-block: 8px;
    padding-inline: 20px;
  }
  .preview {
    height: 200px;
    width: 100%;
    position: relative;
    /*background-image: url("../../asset/header-background.jpeg");*/
  }
  .open-preview {
    position: absolute;
    top: 0px;
    right: 0px;
  }
  .file-properties {
    opacity: 60%;
  }
  .buttons {
    align-items: start;
    gap: 8px;
    margin: 6px 8px 6px 0px;
  }
  .open.buttons {
    margin-block-end: 16px;
  }
  .open.buttons :global(button.disabled svg path) {
    stroke-width: 1px;
  }
</style>
