<hbox class="attachment">
  <hbox class="icon">
    <FileIcon ext={$attachment.filename?.split(".").pop()} size={32} />
  </hbox>
  <vbox flex class="right">
    <hbox class="name font-small">
      {attachment.filename}
    </hbox>
    <hbox class="size font-small">
      {$t`${Math.ceil($attachment.size / 1024)} KB`}
    </hbox>
  </vbox>
  <vbox class="buttons">
    <Button plain icon={ChevronDownIcon} iconSize="16px" iconOnly />
    <Button plain icon={DeleteIcon} iconSize="16px" iconOnly onClick={onDelete} />
  </vbox>
</hbox>

<script lang="ts">
  import type { Attachment } from "../../../../logic/Abstract/Attachment";
  import FileIcon from "../../../Files/Thumbnail/FileIcon.svelte";
  import Button from "../../../Shared/Button.svelte";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import { Collection } from "svelte-collections";
  import { t } from "../../../../l10n/l10n";

  export let attachment: Attachment;
  export let attachments: Collection<Attachment>;

  async function onDelete() {
    attachments.remove(attachment);
  }
</script>

<style>
  .attachment {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    box-shadow: -1px 0px 5px 0.5px rgb(0, 0, 0, 10%);
    border-radius: 5px;
    margin: 4px 6px 4px 12px;
    padding: 4px;
  }
  .icon {
    color: lightgray;
    margin-inline-end: 4px;
  }
  .icon :global(svg) {
    stroke-width: 1px;
  }
  .right {
    margin: 0px 4px;
  }
  .name {
    flex-wrap: wrap;
    font-weight: 500;
    line-height: 1.2;
  }
  .size {
    color: lightgray;
  }
  .buttons {
    align-items: start;
    margin-block-start: 4px;
  }
  .buttons :global(svg) {
    color: lightgrey;
  }
</style>
