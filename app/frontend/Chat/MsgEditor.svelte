<hbox flex class="msg-editor">
  <textarea bind:value={to.draftMessage} placeholder="Write a message to {to.name}..." />
  <vbox class="send-buttons">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <Button classes="send-button" on:click={send} icon={SendIcon} iconSize="24px" plain />
  </vbox>
</hbox>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import Button from "../Shared/Button.svelte";
  import SendIcon from "lucide-svelte/icons/send";

  export let to: Chat;

  function send() {
    let msg = new UserChatMessage();
    msg.outgoing = true;
    msg.text = to.draftMessage;
    msg.html = msg.text;
    msg.to = to;
    msg.contact = to.contact;
    msg.sent = new Date();
    to.sendMessage(msg);
    to.draftMessage = "";
  }
</script>

<style>
  .msg-editor {
    background-color: #EEEEEE;
    padding: 10px;
  }
  textarea {
    flex: 1 0 0;
    font-family: unset;
    padding: 10px 15px;
    border: 1px solid lightgray;
    border-radius: 8px;
  }
  .send-buttons {
    align-self: flex-end;
    margin-left: 8px;
    margin-bottom: 8px;
  }
</style>
