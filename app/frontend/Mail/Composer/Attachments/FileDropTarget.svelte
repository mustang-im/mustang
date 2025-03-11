<hbox flex class="container"
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:dragover={onDragOver}
  >
  {#if dragging}
  <hbox class="overlay">
    {#if isImage && allowInline}
      <hbox flex class="drop-target inline" on:drop={event => onDrop(event, true)}>
        {$t`Insert inline into text`}
      </hbox>
    {/if}
    <hbox flex class="drop-target attachment" on:drop={event => onDrop(event, false)}>
      {$t`Attach file`}
    </hbox>
  </hbox>
  {/if}
  <vbox flex class="content">
    <slot />
  </vbox>
</hbox>

<script lang="ts">
  import { isImageMimetype } from "../../../Shared/Editor/InsertImage";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../../l10n/l10n";

  export let allowInline = false;

  let dragging = 0;
  let isImage = false;
  let dispatch = createEventDispatcher();
  function onDrop(event: DragEvent, inline = false) {
    event.preventDefault(); // Don't load file into browser
    dragging = 0;
    if (!(event.dataTransfer.items && event.dataTransfer.items[0].kind == 'file')) {
      return;
    }
    let files: File[] = [];
    for (let item of event.dataTransfer.items) {
      if (item.kind != "file") {
        continue;
      }
      let file = item.getAsFile();
      files.push(file);
    }
    isImage = files.every(file => isImageMimetype(file.type));
    dispatch(isImage && inline ? "inline-files" : "add-files", { files });
  }

  function onDragOver(event: DragEvent) {
    (event.target as HTMLElement).classList?.add("hover");
    event.preventDefault();
  }
  function onDragEnter(event: DragEvent) {
    event.preventDefault();
    if (!(event.dataTransfer.items && event.dataTransfer.items[0].kind == 'file')) {
      return;
    }
    let mimetypes: string[] = [];
    for (let item of event.dataTransfer.items) {
      if (item.kind != "file") {
        continue;
      }
      mimetypes.push(item.type);
    }
    isImage = mimetypes.every(isImageMimetype);
    dragging++;
  }
  function onDragLeave(event: DragEvent) {
    if (dragging > 0) {
      dragging--;
    }
    (event.target as HTMLElement).classList?.remove("hover");
  }
</script>

<style>
  .container {
    position: relative;
  }
  .overlay {
    position: absolute;
    z-index: 10;
    height: 100%;
    width: 100%;
  }
  .drop-target {
    align-items: center;
    justify-content: center;
    background-color: #00000045;
    border: 2px solid gray;
    border-radius: 10px;
    margin: 32px;
  }
  .drop-target:global(.hover) {
    background-color: #00000065;
  }
  .content {
    z-index: 0;
  }
</style>
