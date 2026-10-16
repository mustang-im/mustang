<vbox class="emoji-pane">
  <hbox class="pane-title">{$t`Emoji`}</hbox>
  <GraphicSelector
    on:select={onEmoji}
    on:backspace={() => catchErrors(onEmojiBackspace)}
    bind:isOpen
    />
</vbox>

<script lang="ts">
  import GraphicSelector from "../../../frontend/Chat/Emoji/GraphicSelector.svelte";
  import { catchErrors } from "../../../frontend/Util/error";
  import { t } from "../../../l10n/l10n";
  import type { Editor } from "@tiptap/core";

  export let editor: Editor;
  export let isOpen = true;

  function onEmoji(ev: CustomEvent) {
    let emoji = ev.detail.emoji;
    if (emoji) {
      editor.commands.insertContent(emoji);
    }
  }

  function onEmojiBackspace() {
    editor.view.focus();
    document.execCommand("delete");
  }
</script>

<style>
  .emoji-pane {
    flex-shrink: 0;
    width: 360px;
    min-height: 0;
    border-inline-start: 1px solid var(--lo-divider);
  }
  .pane-title {
    flex-shrink: 0;
    padding: 10px 12px 4px 12px;
    font-size: var(--lo-font-size-large);
    font-weight: 600;
  }
</style>
