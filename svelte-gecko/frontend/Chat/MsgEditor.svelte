<hbox class="msg-editor">
  <textarea bind:value={text} placeholder="Write a message to {to.name}..." />
  <vbox class="send-buttons">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <hbox class="send-button" on:click={send}>
      <Icon data={sendIcon} scale={1.5} />
    </hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatAccount } from "../../logic/Chat/Account";
  import { ChatMessage } from "../../logic/Chat/Message";
  import type { Person } from "../../logic/Person/Person";
  import Icon from 'svelte-awesome';
  import sendIcon from 'svelte-awesome/icons/send';

  export let to: Person;
  export let from: ChatAccount;

  let text: string;

  function send() {
    console.log("sending " + text + " to " + to.name);
    let msg = new ChatMessage();
    msg.outgoing = true;
    msg.text = text;
    msg.html = text;
    msg.contact = to;
    msg.sent = new Date();
    from.messagesByPerson.get(to).add(msg);
    text = "";
  }
</script>

<style>
  .msg-editor {
    flex: 1 0 0;
    border: 1px solid grey;
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
  .send-button {
    flex: 1 0 0;
  }
</style>
