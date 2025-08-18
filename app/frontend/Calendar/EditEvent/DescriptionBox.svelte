<vbox class="description" flex>
  <HTMLEditorToolbar {editor} />
  <vbox flex class="editor-wrapper flex">
    <Paper>
      <Scroll>
        <vbox flex class="editor">
          <!-- TODO SECURITY Sanitize HTML first before passing it in here.
            One option: A dedicated getter/setter for the editor that sanitizes on get, but doesn't trigger observers on set.
            Binding `descriptionHTML` calls observers, which re-sets `html`, which force-kills the editor. #727 -->
          <HTMLEditor bind:html={event.rawHTMLDangerous} bind:editor />
        </vbox>
      </Scroll>
    </Paper>
  </vbox>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import HTMLEditorToolbar from "../../Shared/Editor/HTMLEditorToolbar.svelte";
  import HTMLEditor from "../../Shared/Editor/HTMLEditor.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Editor } from '@tiptap/core';

  export let event: Event;

  let editor: Editor;
</script>

<style>
  .description {
    margin-top: -8px;
    min-height: 10em;
  }
  .editor-wrapper {
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .editor {
    font-family: unset;
    padding: 8px 12px;
    word-break: break-all;
  }
</style>
