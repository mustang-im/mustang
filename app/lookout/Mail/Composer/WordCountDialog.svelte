<Dialog title={$t`Word Count`} on:close={onDone} width="360px" cancelLabel={$t`Close`}>
  <vbox class="statistics">
    <hbox class="caption">{$t`Statistics:`}</hbox>
    <grid class="rows">
      <span>{$t`Words`}</span>
      <span class="value">{statistics.words.toLocaleString()}</span>
      <span>{$t`Characters (no spaces)`}</span>
      <span class="value">{statistics.charactersWithoutSpaces.toLocaleString()}</span>
      <span>{$t`Characters (with spaces)`}</span>
      <span class="value">{statistics.charactersWithSpaces.toLocaleString()}</span>
      <span>{$t`Paragraphs`}</span>
      <span class="value">{statistics.paragraphs.toLocaleString()}</span>
    </grid>
    {#if isSelection}
      <hbox class="note lo-secondary">{$t`Counted in the selected text`}</hbox>
    {/if}
  </vbox>
</Dialog>

<script lang="ts">
  import { TextStatistics } from "./TextStatistics";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import type { Editor } from "@tiptap/core";
  import { t } from "../../../l10n/l10n";

  export let editor: Editor;
  export let onDone: () => void;

  let statistics = TextStatistics.ofEditor(editor);
  let isSelection = !editor.state.selection.empty;
</script>

<style>
  .statistics {
    gap: 8px;
  }
  .caption {
    font-weight: 600;
  }
  .rows {
    grid-template-columns: 1fr max-content;
    gap: 6px 24px;
    padding-inline-start: 12px;
  }
  .value {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }
  .note {
    font-size: var(--lo-font-size-small);
  }
</style>
