<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="attachment"
  draggable="true"
  on:dragstart={onDragStart}
  >
  <hbox bind:this={iconEl}>
    <hbox class="icon" on:click={() => catchErrors(onOpen)}>
      <FileIcon {ext} size={24} />
    </hbox>
    <vbox class="info">
      <hbox title={attachment.filename} class="filename top-row">
        {attachment.filename}
      </hbox>
      <hbox class="bottom-row">
        <hbox class="size">
          {fileSize(attachment.content?.size)}
        </hbox>
        <hbox flex />
        <hbox class="menu">...</hbox>
      </hbox>
    </vbox>
  </hbox>
</hbox>

<script lang="ts">
  import type { Attachment } from "../../../logic/Mail/Attachment";
  import type { EMail } from "../../../logic/Mail/EMail";
  import { assert } from "../../../logic/util/util";
  import FileIcon from "../../Files/FileIcon.svelte";
  import { fileSize } from "../../Files/fileSize";
  import { catchErrors } from "../../Util/error";

  export let attachment: Attachment;
  export let message: EMail;

  $: ext = attachment.filename.split(".").pop();

  async function onOpen() {
    alert("Open not yet implemented");
  }

  let iconEl: HTMLDivElement;

  function onDragStart(event: DragEvent) {
    assert(attachment.content instanceof File, "Attachment file is missing");
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
    height: 48px;
    margin: 4px;
  }
  .icon {
    aspect-ratio: 1/1;
    background-color: black;
    color: white;
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
    background-color: #FFFFFF50;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%);
  }
  .top-row,
  .bottom-row,
  .menu,
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
    font-size: 16px;
  }
  .bottom-row {
    font-size: 12px;
  }
</style>
