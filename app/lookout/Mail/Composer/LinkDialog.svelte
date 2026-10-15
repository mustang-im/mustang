<Dialog title={$t`Insert Link`} onClose={onCancel} width="480px">
  <grid class="fields">
    {#if !hasSelection}
      <label for="link-text">{$t`Text to display`}</label>
      <input id="link-text" type="text" bind:value={linkText} />
    {/if}
    <label for="link-address">{$t`Address`}</label>
    <input id="link-address" type="url" bind:value={linkTargetURL} autofocus
      placeholder="https://"
      on:keydown={event => event.key == "Enter" && onOK()} />
  </grid>
  <svelte:fragment slot="footer">
    {#if isLink}
      <DialogButton label={$t`Remove Link`} onClick={onRemove} />
      <hbox flex />
    {/if}
    <DialogButton label={$t`OK`} primary onClick={onOK} disabled={!linkTargetURL && $t`Please enter an address`} />
    <DialogButton label={$t`Cancel`} onClick={onCancel} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import DialogButton from "./DialogButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { t } from "../../../l10n/l10n";

  export let editor: Editor;
  export let onDone: () => void;

  let isLink = editor.isActive("link");
  let hasSelection = !editor.state.selection.empty;
  let linkTargetURL: string = editor.getAttributes("link").href ?? "";
  let linkText = "";

  function onOK() {
    if (!linkTargetURL) {
      return;
    }
    if (hasSelection || isLink) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkTargetURL }).run();
    } else {
      editor.chain().focus().insertContent({
        type: "text",
        text: linkText || linkTargetURL,
        marks: [{ type: "link", attrs: { href: linkTargetURL } }],
      }).run();
    }
    onDone();
  }

  function onRemove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onDone();
  }

  function onCancel() {
    editor.commands.focus();
    onDone();
  }
</script>

<style>
  .fields {
    grid-template-columns: max-content 1fr;
    align-items: center;
    gap: 12px 16px;
    padding-block: 8px;
  }
</style>
