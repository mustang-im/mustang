<vbox flex class="attachments-pane">
  <Scroll>
    {#each $attachments.each as attachment}
      <AttachmentEntry {attachment} {attachments} />
    {/each}
    <hbox class="buttons">
      <RoundButton
        icon={AddIcon} label={$t`Add attachment`}
        on:click={onAdd}
        />
    </hbox>
  </Scroll>
</vbox>

<FileSelector bind:this={fileSelector} />

<script lang="ts">
  import { Attachment } from "../../../../logic/Abstract/Attachment";
  import AttachmentEntry from "./AttachmentEntry.svelte";
  import FileSelector from "./FileSelector.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../../l10n/l10n";

  export let attachments: Collection<Attachment>;

  let fileSelector: FileSelector;
  export async function onAdd() {
    let file = await fileSelector.selectFile();
    if (!file) {
      console.log("no file selected");
      return;
    }
    console.log("Selected attachment file", file);
    attachments.add(Attachment.fromFile(file));
  }
</script>

<style>
  .buttons {
    justify-content: center;
    margin-block-start: 12px;
  }
</style>
