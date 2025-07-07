<vbox class="description" flex>
  <HTMLEditorToolbar {editor} />
  <vbox flex class="editor-wrapper flex">
    <Paper>
      <Scroll>
        <vbox flex class="editor">
          <HTMLEditor bind:html={event.descriptionHTML} bind:editor />
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
