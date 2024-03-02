<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox flex
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:dragover={onDragOver}
  >
  {#if dragging}
    {#if allowInline}
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
  import { createEventDispatcher } from "svelte";

  export let allowInline = false;

  let dragging = 0;
  let dispatch = createEventDispatcher();
  function onDrop(event: DragEvent, inline = false) {
    console.log("on drop");
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
    dispatch(inline ? "inline-files" : "add-files", { files });
  }

  function onDragOver(event: DragEvent) {
    console.log("on drag over");
    event.preventDefault();
  }
  function onDragEnter(event: DragEvent) {
    console.log("on drag enter");
    event.preventDefault();
    dragging++;
  }
  function onDragLeave() {
    console.log("on drag leave");
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
