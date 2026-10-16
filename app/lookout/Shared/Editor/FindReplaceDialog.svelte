<Dialog title={$t`Find and Replace`} on:close={onDone} width="520px">
  <DialogTabs tabs={[{ id: "find", label: $t`Find` }, { id: "replace", label: $t`Replace` }]}
    bind:selected={tab} />
  <grid class="fields">
    <span>{$t`Find what:`}</span>
    <TextField label={$t`Find what:`} bind:value={term}
      on:input={() => status = ""} on:keydown={onEnter} />
    {#if tab == "replace"}
      <span>{$t`Replace with:`}</span>
      <TextField label={$t`Replace with:`} bind:value={replacement} on:keydown={onEnter} />
    {/if}
  </grid>
  {#if showOptions}
    <vbox class="options">
      <hbox class="caption">{$t`Search Options`}</hbox>
      <CheckBox label={$t`Match case`} bind:checked={matchCase} />
    </vbox>
  {/if}
  <hbox class="status" role="status">{status}</hbox>
  <svelte:fragment slot="footer">
    <DialogButton label={showOptions ? $t`<< Less` : $t`More >>`} onClick={toggleOptions} />
    <hbox flex />
    {#if tab == "replace"}
      <DialogButton label={$t`Replace`} disabled={!term} onClick={onReplace} />
      <DialogButton label={$t`Replace All`} disabled={!term} onClick={onReplaceAll} />
    {/if}
    <DialogButton label={$t`Find Next`} primary disabled={!term} onClick={onFindNext} />
    <DialogButton label={$t`Cancel`} onClick={onDone} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import { EditorFind } from "./EditorFind";
  import Dialog from "../Dialog/Dialog.svelte";
  import DialogButton from "../Dialog/DialogButton.svelte";
  import DialogTabs from "../Dialog/DialogTabs.svelte";
  import TextField from "../Form/TextField.svelte";
  import CheckBox from "../Form/CheckBox.svelte";
  import type { Editor } from "@tiptap/core";
  import { onDestroy } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let editor: Editor;
  export let replaceMode = false;
  export let onDone: () => void;

  let tab = replaceMode ? "replace" : "find";
  let { from, to } = editor.state.selection;
  let term = editor.state.doc.textBetween(from, to, " ").slice(0, 255);
  let replacement = "";
  let matchCase = false;
  let showOptions = false;
  let status = "";

  onDestroy(() => EditorFind.clearFound());

  function toggleOptions() {
    showOptions = !showOptions;
  }

  function onFindNext() {
    status = EditorFind.findNext(editor, term, matchCase) ? "" : $t`The search item was not found.`;
  }

  function onReplace() {
    status = EditorFind.replace(editor, term, replacement, matchCase) ? "" : $t`The search item was not found.`;
  }

  function onReplaceAll() {
    EditorFind.clearFound();
    let count = EditorFind.replaceAll(editor, term, replacement, matchCase);
    status = count ? $t`All done. ${count} replacements were made.` : $t`The search item was not found.`;
  }

  function onEnter(event: KeyboardEvent) {
    if (event.key == "Enter" && term) {
      event.preventDefault();
      onFindNext();
    }
  }
</script>

<style>
  :global(::highlight(lookout-find)) {
    background-color: var(--lo-selected-bg);
    color: var(--lo-fg);
  }
  .fields {
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 8px 12px;
    padding-block-start: 16px;
  }
  .options {
    gap: 6px;
    margin-block-start: 12px;
  }
  .caption {
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
  .caption::after {
    content: "";
    flex: 1 1 auto;
    border-block-start: 1px solid var(--lo-divider);
  }
  .status {
    min-height: 20px;
    margin-block-start: 8px;
    color: var(--lo-fg-secondary);
  }
</style>
