{#if editor && openedTool == EditorTool.Link}
  <LinkDialog {editor} onDone={close} />
{:else if editor && openedTool == EditorTool.DateTime}
  <DateTimeDialog {editor} onDone={close} />
{:else if editor && openedTool == EditorTool.Symbol}
  <SymbolDialog {editor} onDone={close} />
{:else if editor && openedTool == EditorTool.WordCount}
  <WordCountDialog {editor} onDone={close} />
{:else if editor && (openedTool == EditorTool.Find || openedTool == EditorTool.Replace)}
  <FindReplaceDialog {editor} replaceMode={openedTool == EditorTool.Replace} onDone={close} />
{/if}

<script lang="ts">
  import { EditorTool } from "./EditorCommands";
  import LinkDialog from "./LinkDialog.svelte";
  import DateTimeDialog from "./DateTimeDialog.svelte";
  import SymbolDialog from "./SymbolDialog.svelte";
  import WordCountDialog from "./WordCountDialog.svelte";
  import FindReplaceDialog from "./FindReplaceDialog.svelte";
  import type { Editor } from "@tiptap/core";

  export let editor: Editor | null;
  export let openedTool: EditorTool | null = null;

  function close() {
    openedTool = null;
  }
</script>
