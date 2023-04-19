<hbox class="message" class:incoming={!message.outgoing} class:outgoing={message.outgoing}>
  {#if !message.outgoing}
    <vbox class="avatar">
      <img
        src={message.contact.picture}
        width="32" height="32"
        title="Picture of {message.contact.name}"
        alt="Picture of {message.contact.name}" />
    </vbox>
  {/if}
  <vbox class="right">
    <hbox class="meta">
      {#if !message.outgoing}
        <hbox class="from">{message.contact.name}</hbox>
      {/if}
      <hbox class="time">{timeFormat.format(message.sent)}</hbox>
    </hbox>
    <hbox class="text">{@html message.html }</hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";

  export let message: ChatMessage;

  const timeFormat = Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
</script>

<style>
  /** Speech bubble */
  .message {
    flex: 1 0 0;
    margin: 3px 30px;
    padding: 3px 10px;
    max-width: 70%;
    border: 1px outset white;
    border-radius: 10px;
    padding: 10px 15px;
    position: relative;
    color: black;
  }
  .incoming {
    align-self: flex-start;
    background-color: white;
  }
  .outgoing {
    align-self: flex-end;
    background-color: papayawhip;
  }

  /** Speech bubble arrow */
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

  .avatar {
    width: 32px;
    height: 32px;
    margin-top: 3px;
    margin-right: 10px;
    clip-path: circle();
  }
  .meta {
    margin-bottom: 2px;
  }
  .from {
    font-size: x-small;
    font-weight: bold;
    margin-right: 16px;
  }
  .time {
    font-size: x-small;
    color: gray;
  }
  .text {
    font-size: smaller;
  }
</style>
