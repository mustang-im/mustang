<vbox flex class="attachments-pane">
  <Scroll>
    {#each $attachments.each as attachment}
      <AttachmentEntry {attachment} {attachments} />
    {/each}
    <hbox class="buttons">
      <RoundButton
        icon={AddIcon} label={$t`Add attachment`}
        onClick={onAdd}
        />
    </hbox>
  </Scroll>
</vbox>

<FileSelector bind:this={fileSelector} />

<script lang="ts">
  import type { Message } from "../../../../logic/Abstract/Message";
  import AttachmentEntry from "./AttachmentEntry.svelte";
  import FileSelector from "./FileSelector.svelte";
  import RoundButton from "../../../Shared/RoundButton.svelte";
  import Scroll from "../../../Shared/Scroll.svelte";
  import AddIcon from "lucide-svelte/icons/plus";
  import { t } from "../../../../l10n/l10n";

  export let message: Message;
  $: attachments = message.attachments;

  let fileSelector: FileSelector;
  export async function onAdd() {
    let file = await fileSelector.selectFile();
    if (!file) {
      console.log("no file selected");
      return;
    }
    let attachment = message.newAttachment();
    attachment.fromFile(file);
    message.attachments.add(attachment);
  }
</script>

<style>
  .buttons {
    justify-content: center;
    margin-block-start: 12px;
  }
</style>
