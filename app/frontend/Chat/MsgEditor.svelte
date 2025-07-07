<FileDropTarget
  on:add-files={onAddAttachment}
  on:inline-files={onAddInline}
  allowInline={true}>
  <hbox flex class="msg-editor">
    <vbox flex class="editor-wrapper">
      <HTMLEditorToolbar {editor} />
      <vbox flex class="editor-scroll-wrapper">
        <Scroll>
          <vbox flex class="editor">
            {#key to}
              <HTMLEditor bind:html={to.draftMessage} bind:editor />
            {/key}
          </vbox>
        </Scroll>
      </vbox>
    </vbox>
    {#if $attachments.hasItems}
      <AttachmentsPane {attachments} />
    {/if}
    <vbox class="send-buttons">
      <RoundButton classes="send-button"
        onClick={send}
        icon={SendIcon}
        iconSize="24px"
        padding="6px"
        border={false}
        disabled={!to.draftMessage}
        />
    </vbox>
  </hbox>
</FileDropTarget>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import { Attachment } from "../../logic/Abstract/Attachment";
  import { insertImage } from "../Shared/Editor/InsertImage";
  import HTMLEditorToolbar from "../Shared/Editor/HTMLEditorToolbar.svelte";
  import HTMLEditor from "../Shared/Editor/HTMLEditor.svelte";
  import FileDropTarget from "../Mail/Composer/Attachments/FileDropTarget.svelte";
  import AttachmentsPane from "../Mail/Composer/Attachments/AttachmentsPane.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import type { Editor } from '@tiptap/core';
  import { ArrayColl } from "svelte-collections";

  export let to: Chat;

  let editor: Editor;

  let attachments = new ArrayColl<Attachment>();
  $: to && attachments.clear(); // TODO save as draft

  async function send() {
    if (!to.draftMessage) {
      return;
    }
    let msg = new UserChatMessage(to);
    msg.outgoing = true;
    msg.html = to.draftMessage;
    msg.text; // Generate to keep in sync
    msg.contact = to.contact;
    msg.sent = new Date();
    await to.sendMessage(msg);
    reset();
  }

  function reset() {
    to.draftMessage = "";
    editor.commands.setContent(""); // TODO fix HTMLEditor to listen to `html`
    attachments.clear();
  }

  function onAddAttachment(event: CustomEvent) {
    let files = event.detail.files as File[];
    attachments.addAll(files.map(file => Attachment.fromFile(file)));
  }

  function onAddInline(event: CustomEvent) {
    let files = event.detail.files as File[];
    for (let file of files) {
      insertImage(editor, file, attachments);
    }
  }
</script>

<style>
  .msg-editor {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    padding: 4px 4px 10px 10px;
  }
  .editor-wrapper {
    flex: 3 0 0;
  }
  .editor-scroll-wrapper {
    background-color: var(--main-bg);
    color: var(--main-bf);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  .editor {
    font-family: unset;
    padding: 8px 12px;
  }
  .send-buttons {
    align-self: flex-end;
    margin-inline-start: 2px;
    margin-block-end: 2px;
  }
  .send-buttons :global(.button) {
    background-color: unset;
  }
</style>
