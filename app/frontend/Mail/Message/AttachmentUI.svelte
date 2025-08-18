<hbox class="attachment"
  draggable="true"
  on:dragstart={onDragStart}
  >
  <hbox bind:this={iconEl}>
    <hbox class="icon" on:click={() => catchErrors(onOpen)}>
      <FileIcon ext={attachment.ext} localFilePath={attachment.filepathLocal} size={24} />
    </hbox>
    <vbox class="info">
      <hbox title={$attachment.filename} class="filename top-row font-normal">
        {$attachment.filename}
      </hbox>
      <hbox class="bottom-row font-smallest">
        <hbox class="size">
          {$attachment.size ? fileSize($attachment.size) : $t`Not downloaded`}
        </hbox>
        <hbox flex />
        <AttachmentMenu {attachment} />
      </hbox>
    </vbox>
  </hbox>
</hbox>

<script lang="ts">
  import type { Attachment } from "../../../logic/Abstract/Attachment";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { assert } from "../../../logic/util/util";
  import AttachmentMenu from "./AttachmentMenu.svelte";
  import FileIcon from "../../Files/Thumbnail/FileIcon.svelte";
  import { fileSize } from "../../Files/fileSize";
  import { catchErrors } from "../../Util/error";
  import { t } from "../../../l10n/l10n";

  export let attachment: Attachment;
  export let message: EMail;

  async function onOpen() {
    await attachment.openOSApp();
  }

  let iconEl: HTMLDivElement;

  function onDragStart(event: DragEvent) {
    assert(attachment.content instanceof File, $t`Attachment file is missing`);
    event.dataTransfer.items.clear();
    event.dataTransfer.items.add(attachment.content);
    event.dataTransfer.setDragImage(iconEl as HTMLElement, 0, 0);
    event.dataTransfer.effectAllowed = "copy";
    for (let item of event.dataTransfer.items) {
      console.log("dragging attachment file", item, item.kind, item.type);
    }
    // TODO doesn't work for me: Creates a .txt file with the filename as content
  }
</script>

<style>
  .attachment {
    height: 40px;
    margin: 4px;
  }
  .icon {
    aspect-ratio: 1/1;
    background-color: var(--outstanding-bg);
    color: var(--outstanding-fg);
    align-items: center;
    justify-content: center;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
  .info {
    width: 160px;
    padding: 2px 8px 2px 8px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    background-color: var(--main-bg);
    color: var(--main-fg);
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%);
  }
  .attachment:hover .icon {
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
  }
  .top-row,
  .bottom-row,
  .size {
    align-items: center;
  }
  .filename,
  .size {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .top-row {
  }
  .bottom-row {
  }
  .bottom-row :global(.svelteui-Popper-root) {
    position: fixed;
  }
</style>
