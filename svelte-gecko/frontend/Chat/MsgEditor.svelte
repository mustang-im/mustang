<hbox flex class="msg-editor">
  <textarea bind:value={to.draftMessage} placeholder="Write a message to {to.name}..." />
  <vbox class="send-buttons">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <hbox flex class="send-button" on:click={send}>
      <Icon data={sendIcon} scale={1.5} />
    </hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { ChatMessage } from "../../logic/Chat/Message";
  import Icon from 'svelte-awesome';
  import sendIcon from 'svelte-awesome/icons/send';

  export let to: Chat;

  function send() {
    console.log("sending " + to.draftMessage + " to " + to.name);
    let msg = new ChatMessage();
    msg.outgoing = true;
    msg.text = to.draftMessage;
    msg.html = msg.text;
    msg.to = to;
    msg.contact = to.contact;
    msg.sent = new Date();
    to.messages.add(msg);
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
    align-self: center;
    margin-left: 10px;
  }
</style>
