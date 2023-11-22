<hbox flex
  class="message"
  class:incoming={!message.outgoing}
  class:outgoing={message.outgoing}
  class:followup
  class:system={message instanceof ChatRoomEvent}
  deliveryStatus={message.deliveryStatus}
  >
  {#if !message.outgoing && !followup}
    <vbox hidden class="avatar">
      <img
        src={message.contact.picture}
        width="32" height="32"
        title="Picture of {message.contact.name}"
        alt="" />
    </vbox>
  {/if}
  <vbox class="right">
    {#if !followup}
      <hbox class="meta">
        {#if !message.outgoing}
          <hbox class="from">{message.contact.name}</hbox>
        {/if}
        <hbox class="time">{getDateString(message.sent)}</hbox>
      </hbox>
    {/if}
    <vbox class="bubble">
      <hbox class="text selectable">{@html message.html }</hbox>
    </vbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { UserChatMessage, ChatMessage } from "../../../logic/Chat/Message";
  import { ChatRoomEvent } from "../../../logic/Chat/RoomEvent";
  import { getDateString } from "../../Util/date";

  export let message: UserChatMessage;
  export let previousMessage: ChatMessage = null;
  $: followup = message.contact == previousMessage?.contact && // same author
    message.outgoing == previousMessage?.outgoing && // same author
    message.sent.getMilliseconds() - previousMessage.sent.getMilliseconds() < 5 * 60 * 1000; // < 5 mins apart
</script>

<style>
  .message {
    margin: 16px 32px 0 20px;
    color: black;
  }
  .message.system {
    margin: 8px 32px 0 20px;
  }
  .incoming {
    align-self: flex-start;
  }
  .outgoing {
    align-self: flex-end;
  }
  /** Speech bubble */
  .message:not(.system) .bubble {
    position: relative; /* arrows are relative to this */
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    padding: 7px 15px;
  }
  .incoming:not(.system) .bubble {
    background-color: rgba(255, 255, 255, 90%);
    border-top-right-radius: 12px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 7%);
  }
  .outgoing:not(.system) .bubble {
    background-color: #d6d5dc;
    border-top-left-radius: 12px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 15%);
  }
  .message.followup {
    margin-top: 3px;
  }

  /** Speech bubble arrow */
  .message:not(.followup):not(.system) .bubble::before {
    content: '';
    position: absolute; /* relative to .bubble position: relative */
    border-style: solid;
  }
  .incoming .bubble::before {
    top: 0;
    left: -10px;
    border-width: 10px 0 0 10px;
    border-color: white transparent transparent transparent;
  }
  .outgoing .bubble::before {
    top: 0;
    left: 100%;
    border-width: 10px 10px 0 0;
    border-color: #d6d5dc transparent transparent transparent;
  }
  .incoming.followup .bubble {
    border-top-left-radius: 12px;
  }
  .outgoing.followup .bubble {
    border-top-right-radius: 12px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    margin-top: 3px;
    margin-right: 20px;
    clip-path: circle();
  }
  .message.followup.incoming {
    /* no avatar */
    padding-left: 52px;
  }
  .meta {
    margin-bottom: 2px;
    font-size: x-small;
    color: #999999;
  }
  .incoming .meta {
    margin-left: 10px;
  }
  .outgoing .meta {
    justify-content: end;
    margin-right: 10px;
  }
  .from {
    margin-right: 16px;
  }
  .text {
    font-size: 13.3px;
  }

  .outgoing[deliveryStatus=sending] {
    opacity: 70%;
  }

  .system .text {
    font-size: 9px;
  }
  .system .text :global(.person) {
    color: blue;
  }
</style>
