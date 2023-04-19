{#if message.sent.getDate() != previousMessage?.sent.getDate() }
  <hbox class="date-separator">
    {longDayFormat.format(message.sent)}
  </hbox>
{/if}

<hbox class="message" class:incoming={!message.outgoing} class:outgoing={message.outgoing} class:followup={followup}>
  {#if !message.outgoing && !followup}
    <vbox class="avatar">
      <img
        src={message.contact.picture}
        width="32" height="32"
        title="Picture of {message.contact.name}"
        alt="Picture of {message.contact.name}" />
    </vbox>
  {/if}
  <vbox class="right">
    {#if !followup}
      <hbox class="meta">
        {#if !message.outgoing}
          <hbox class="from">{message.contact.name}</hbox>
        {/if}
        <hbox class="time">{timeFormat.format(message.sent)}</hbox>
      </hbox>
    {/if}
    <hbox class="text">{@html message.html }</hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";

  export let message: ChatMessage;
  export let previousMessage: ChatMessage = null;
  $: followup = message.contact == previousMessage?.contact && // same author
    message.outgoing == previousMessage?.outgoing && // same author
    message.sent.getMilliseconds() - previousMessage.sent.getMilliseconds() < 5 * 60 * 1000; // < 5 mins apart

  const timeFormat = Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const longDayFormat = Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<style>
  /** Speech bubble */
  .message {
    flex: 1 0 0;
    margin: 15px 30px 0 30px;
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
  .message.followup {
    margin-top: -3px;
    border-top: none;
    border-top-left-radius: 0px;
  }
  .message.followup.incoming {
    padding-left: 56px;
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

  .date-separator {
    width: 50%;
    align-self: center;
    justify-content: center;
    margin: 20px 20px 0px 20px;
    padding: 5px;
    font-size: smaller;
    color: gray;
    border-top: 1px dotted lightgray;
  }
</style>
