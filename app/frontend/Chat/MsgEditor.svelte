<FileDropTarget
  on:add-files={onAddAttachment}>
  <!--on:inline-files={onAddInline}
  allowInline={true}>-->
  <vbox flex class="msg-editor">
    {#if $attachments.hasItems}
      <vbox class="attachments">
        <AttachmentsPane {attachments} />
      </vbox>
    {/if}
    <hbox flex>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <vbox flex class="editor-wrapper" on:keydown|capture={ev => isEnterSend && onKeyEnter(ev, () => catchErrors(send))}>
        <HTMLEditorToolbar {editor}>
          <Button classes="enter-toggle"
            onClick={() => isEnterSend = !isEnterSend}
            icon={EnterKeyIcon}
            iconSize="16px"
            selected={!isEnterSend}
            slot="last"
            />
        </HTMLEditorToolbar>
        <vbox flex class="editor-scroll-wrapper">
          <Scroll>
            <vbox flex class="editor">
              <HTMLEditor bind:html={to.draftMessage} bind:editor />
            </vbox>
          </Scroll>
        </vbox>
      </vbox>
      <vbox class="send-buttons">
        <RoundButton classes="send-button"
          onClick={send}
          icon={SendIcon}
          iconSize="24px"
          padding="6px"
          border={false}
          disabled={!to.draftMessage && $attachments.isEmpty}
          />
      </vbox>
    </hbox>
  </vbox>
</FileDropTarget>

<script lang="ts">
  import type { ChatRoom } from "../../logic/Chat/ChatRoom";
  import { Attachment } from "../../logic/Abstract/Attachment";
  import { insertImage } from "../Shared/Editor/InsertImage";
  import HTMLEditorToolbar from "../Shared/Editor/HTMLEditorToolbar.svelte";
  import HTMLEditor from "../Shared/Editor/HTMLEditor.svelte";
  import FileDropTarget from "../Mail/Composer/Attachments/FileDropTarget.svelte";
  import AttachmentsPane from "../Mail/Composer/Attachments/AttachmentsPane.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Button from "../Shared/Button.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import EnterKeyIcon from "lucide-svelte/icons/corner-down-left";
  import { onKeyEnter } from "../Util/util";
  import { catchErrors } from "../Util/error";
  import { ArrayColl } from "svelte-collections";
  import type { Editor } from '@tiptap/core';

  export let to: ChatRoom;

  let editor: Editor;

  let isEnterSend = true;
  let attachments = new ArrayColl<Attachment>();
  $: to && attachments.clear(); // TODO save as draft

  async function send() {
    if (!to.draftMessage && attachments.isEmpty) {
      return;
    }
    let msg = to.newMessage();
    msg.outgoing = true;
    msg.html = to.draftMessage;
    msg.text; // Generate to keep in sync
    msg.contact = to.contact;
    msg.attachments.addAll(attachments);
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
  .attachments {
    height: 112px;
  }
  .attachments :global(.attachments-pane .inside) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: start;
  }
  .attachments :global(.attachments-pane .attachment) {
    min-width: 200px;
  }
  .attachments :global(.attachments-pane .buttons) {
    margin-inline-start: 12px;
  }
  .editor-wrapper {
    flex: 3 0 0;
    height: 112px;
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
