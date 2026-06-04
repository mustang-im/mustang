<vbox class="right-side-bar" flex>
  {#if canPreview}
    <vbox class="preview">
      <Thumbnail {file} size={200} />
      <hbox class="open-preview buttons">
        <RoundButton
          onClick={onOpenPreview}
          icon={OpenPreviewIcon}
          />
      </hbox>
    </vbox>
  {:else}
    <vbox class="preview" />
  {/if}
  <vbox class="content" flex>
    <hbox class="open buttons">
      <Button
        onClick={onOpenLocal}
        label={$t`Open`}
        label-should={$t`Open with ${"PhotoShop"}`}
        tooltip={$t`Open with a local application on your computer`}
        >
        <FileIcon ext={file.ext} localFilePath={file.path} size={20} slot="icon" />
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
      <hbox class="lastMod">{getDateTimeString(file.lastMod)}</hbox>
      <hbox flex />
      <hbox class="size">{fileSize(file.size)}</hbox>
    </hbox>

    <ActionToolbar {file} />
  </vbox>
</vbox>

<script lang="ts">
  import type { File } from "../../../logic/Files/File";
  import { startWebApp } from "../../WebApps/Runner/open";
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import Rename from "./Rename.svelte";
  import ActionToolbar from "./ActionToolbar.svelte";
  import FileIcon from "../Thumbnail/FileIcon.svelte";
  import ErrorMessageInline from "../../Shared/ErrorMessageInline.svelte";
  import Button from "../../Shared/Button.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import OpenLocalIcon from "lucide-svelte/icons/square-arrow-out-up-right";
  import OpenPreviewIcon from "lucide-svelte/icons/expand";
  import { catchErrors } from "../../Util/error";
  import { assert, NotImplemented } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";
  import { fileSize } from "../file";
  import { getDateTimeString } from "../../Util/date";
  import Thumbnail from "../Thumbnail/Thumbnail.svelte";
  import { onMount } from "svelte";

  export let file: File;

  let error: ErrorMessageInline;

  onMount(() => catchErrors(onLoad, error.showError));
  async function onLoad() {
    await file.getURL();
  }

  let editors: Collection<WebAppListed>;
  $: error && catchErrors(async () => editors = await file.availableOnlineEditors(), error.showError);

  let canPreview = true;

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
  function onOpenPreview() {
    throw new NotImplemented();
  }
</script>

<style>
  .right-side-bar {
    box-shadow: -2px 0px 3px 1px #e3e3e3;
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
    bottom: 4px;
    right: 4px;
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
