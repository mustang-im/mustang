<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="attachment">
  <hbox class="icon" on:click={() => catchErrors(onOpen)}>
    <FileIcon {ext} size={24} />
  </hbox>
  <vbox class="info">
    <hbox class="filename top-row">
      {attachment.filename}
    </hbox>
    <hbox class="bottom-row">
      <hbox class="size">
        {fileSize(attachment.content?.size)}
      </hbox>
      <hbox flex />
      <hbox class="menu">...</hbox>
    </hbox>
</hbox>

<script lang="ts">
  import type { Attachment } from "../../../logic/Mail/Attachment";
  import type { EMail } from "../../../logic/Mail/EMail";
  import FileIcon from "../../Files/FileIcon.svelte";
  import { fileSize } from "../../Files/fileSize";
  import { catchErrors } from "../../Util/error";

  export let attachment: Attachment;
  export let message: EMail;

  $:console.log("attachment", attachment);

  $: ext = attachment.filename.split(".").pop();

  async function onOpen() {
    alert("Open not yet implemented");
  }
</script>

<style>
  .attachment {
    height: 48px;
    margin: 8px;
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
  }
  .top-row {
    font-size: 16px;
  }
  .bottom-row {
    font-size: 12px;
  }
</style>
