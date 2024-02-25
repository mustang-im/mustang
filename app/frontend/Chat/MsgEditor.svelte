<hbox flex class="msg-editor">
  <vbox flex>
    <HTMLEditorToolbar {editor} />
    <vbox flex class="editor-wrapper">
      <Scroll>
        <vbox flex class="editor">
          <HTMLEditor bind:html={to.draftMessage} bind:editor />
        </vbox>
      </Scroll>
    </vbox>
  </vbox>
  <vbox class="send-buttons">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <RoundButton classes="send-button"
      on:click={send}
      icon={SendIcon}
      iconSize="24px"
      padding="6px"
      border={false}
      disabled={!to.draftMessage}
      />
  </vbox>
</hbox>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import HTMLEditorToolbar from "../Shared/Editor/HTMLEditorToolbar.svelte";
  import HTMLEditor from "../Shared/Editor/HTMLEditor.svelte";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import SendIcon from "lucide-svelte/icons/send";
  import type { Editor } from '@tiptap/core';

  export let to: Chat;

  let editor: Editor;

  function send() {
    if (!to.draftMessage) {
      return;
    }
    let msg = new UserChatMessage();
    msg.outgoing = true;
    msg.text = to.draftMessage;
    msg.html = msg.text;
    msg.to = to;
    msg.contact = to.contact;
    msg.sent = new Date();
    to.sendMessage(msg);
    to.draftMessage = "";
    editor.commands.setContent(""); // TODO fix HTMLEditor to listen to `html`
  }
</script>

<style>
  .msg-editor {
    background-color: #EEEEEE;
    padding: 4px 4px 10px 10px;
  }
  .editor-wrapper {
    border: 1px solid lightgray;
    border-radius: 8px;
    background-color: white;
  }
  .editor {
    font-family: unset;
    padding: 8px 12px;
  }
  .send-buttons {
    align-self: flex-end;
    margin-left: 2px;
    margin-bottom: 2px;
  }
  .send-buttons :global(.button) {
    background-color: unset;
  }
</style>
