<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox flex
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:dragover={onDragOver}
  >
  {#if dragging}
    {#if isImage && allowInline}
      <hbox flex class="drop-target inline" on:drop={event => onDrop(event, true)}>
        Insert inline into text
      </hbox>
    {/if}
    <hbox flex class="drop-target attachment" on:drop={event => onDrop(event, false)}>
      Attach file
    </hbox>
  {:else}
    <slot />
  {/if}
</hbox>

<script lang="ts">
  import { isImageMimetype } from "../../../Shared/Editor/InsertImage";
  import { createEventDispatcher } from "svelte";

  export let allowInline = false;

  let dragging = 0;
  let isImage = false;
  let dispatch = createEventDispatcher();
  function onDrop(event: DragEvent, inline = false) {
    event.preventDefault(); // Don't load file into browser
    dragging = 0;
    if (!event.dataTransfer.items) {
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
    event.preventDefault();
  }
  function onDragEnter(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer.items) {
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
  function onDragLeave() {
    dragging--;
  }
</script>

<style>
  .drop-target {
    align-items: center;
    justify-content: center;
    background-color: #00000055;
    border: 2px solid gray;
    border-radius: 10px;
    margin: 32px;
  }
</style>
