<Dialog title={$t`Insert Link`} on:close={onClose} width="480px"
  okLabel={$t`OK`}
  okDisabled={!linkTargetURL && $t`Please enter an address`}
  onOK={onOK}>
  <grid class="fields">
    {#if !hasSelection}
      <label for="link-text">{$t`Text to display`}</label>
      <input id="link-text" class="lo-text-field" type="text" bind:value={linkText} />
    {/if}
    <label for="link-address">{$t`Address`}</label>
    <input id="link-address" class="lo-text-field" type="url" bind:value={linkTargetURL} autofocus
      placeholder="https://" />
  </grid>
  <svelte:fragment slot="buttons-start">
    {#if isLink}
      <DialogButton label={$t`Remove Link`} onClick={onRemove} />
    {/if}
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import type { Editor } from "@tiptap/core";
  import { t } from "../../../l10n/l10n";

  export let editor: Editor;
  export let onDone: () => void;

  let isLink = editor.isActive("link");
  let hasSelection = !editor.state.selection.empty;
  let linkTargetURL: string = editor.getAttributes("link").href ?? "";
  let linkText = "";

  function onOK() {
    if (hasSelection || isLink) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkTargetURL }).run();
    } else {
      editor.chain().focus().insertContent({
        type: "text",
        text: linkText || linkTargetURL,
        marks: [{ type: "link", attrs: { href: linkTargetURL } }],
      }).run();
    }
  }

  function onRemove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onDone();
  }

  function onClose() {
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
