<vbox class="message" class:incoming={!message.outgoing} class:outgoing={message.outgoing}>
  {@html message.html }
</vbox>

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";

  export let message: ChatMessage;
</script>

<style>
  .message {
    flex: 1 0 0;
    margin: 3px 30px;
    padding: 3px 10px;
    max-width: 70%;
  }
  .incoming {
    align-self: flex-start;
    background-color: white;
    color: black;
    border-radius: 10px;
    border: 1px outset white;
    padding: 10px 15px;
    position: relative;
  }
  .outgoing {
    align-self: flex-end;
    background-color: papayawhip;
    color: black;
    border-radius: 10px;
    border: 1px outset white;
    padding: 10px 15px;
    position: relative;
  }

  .incoming::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 10px;
    border-width: 10px 10px 0 0;
    border-style: solid;
    border-color: white transparent transparent transparent;
  }
  .outgoing::before {
    content: '';
    position: absolute;
    top: 100%;
    right: 10px;
    border-width: 10px 0 0 10px;
    border-style: solid;
    border-color: papayawhip transparent transparent transparent;
  }
</style>
