<hbox class="attachment">
  <hbox class="icon">
    <FileIcon ext={$attachment.filename?.split(".").pop()} size={32} />
  </hbox>
  <vbox flex class="right">
    <hbox class="name">
      {attachment.filename}
    </hbox>
    <hbox class="size">
      {$t`${Math.ceil($attachment.size / 1024)}KB`}
    </hbox>
  </vbox>
  <vbox class="buttons">
    <Button plain icon={ChevronDownIcon} iconSize="16px" iconOnly />
  </vbox>
</hbox>

<script lang="ts">
  import type { Attachment } from "../../../../logic/Mail/Attachment";
  import FileIcon from "../../../Files/FileIcon.svelte";
  import Button from "../../../Shared/Button.svelte";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import { t } from "../../../../l10n/l10n";

  export let attachment: Attachment;
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
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
  }
  .size {
    font-size: 14px;
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
