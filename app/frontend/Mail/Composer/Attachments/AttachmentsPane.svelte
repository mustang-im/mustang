<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox flex class="attachments-pane">
  <Scroll>
    {#each $attachments.each as file}
      <AttachmentEntry {file} />
    {/each}
    <hbox class="buttons">
      <RoundButton
        icon={AddIcon} label="Add attachment"
        on:click={onAdd}
        />
    </hbox>
  </Scroll>
</vbox>

<FileSelector bind:this={fileSelector} />

<script lang="ts">
  import AttachmentEntry from "./AttachmentEntry.svelte";
  import FileSelector from "./FileSelector.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import type { Collection } from "svelte-collections";

  export let attachments: Collection<File>;

  let fileSelector: FileSelector;
  export async function onAdd() {
    let file = await fileSelector.selectFile();
    if (!file) {
      console.log("no file selected");
      return;
    }
    console.log("selected file", file);
    attachments.add(file);
  }
</script>

<style>
  .buttons {
    justify-content: center;
    margin-top: 12px;
  }
</style>
