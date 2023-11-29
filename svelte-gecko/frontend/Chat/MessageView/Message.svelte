<hbox flex
  class="message"
  class:incoming={!message.outgoing}
  class:outgoing={message.outgoing}
  class:followup
  deliveryStatus={message.deliveryStatus}
  >
  {#if !message.outgoing && !followup}
    <vbox hidden class="avatar">
      {#if message.contact.picture}
        <img
          src={message.contact.picture}
          width="32" height="32"
          title="Picture of {message.contact.name}"
          alt="" />
      {/if}
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
      <!-- TODO Sanitize HTML. It comes from untrusted sources. Dangerous! -->
      <div class="text selectable">{@html message.html }</div>
    </vbox>
    {#if $reactions.length > 0}
      <hbox class="reactions">
        {#each $reactions.entries().each as [sender, emoji]}
          <hbox class="reaction" title={emoji + " " + sender?.name}>{emoji}</hbox>
        {/each}
      </hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { UserChatMessage, ChatMessage } from "../../../logic/Chat/Message";
  import { getDateString } from "../../Util/date";

  export let message: UserChatMessage;
  export let previousMessage: ChatMessage = null;
  $: followup = message.contact == previousMessage?.contact && // same author
    message.outgoing == previousMessage?.outgoing && // same author
    message.sent.getMilliseconds() - previousMessage.sent.getMilliseconds() < 5 * 60 * 1000; // < 5 mins apart
  $: reactions = message.reactions;
</script>

<style>
  .message {
    margin: 16px 32px 0 20px;
    color: black;
    max-width: 85%;
  }
  .incoming {
    align-self: flex-start;
  }
  .outgoing {
    align-self: flex-end;
  }
  /** Speech bubble */
  .message .bubble {
    position: relative; /* arrows are relative to this */
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    padding: 7px 15px;
  }
  .incoming .bubble {
    background-color: rgba(255, 255, 255, 90%);
    border-top-right-radius: 12px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 7%);
  }
  .outgoing .bubble {
    background-color: #CDECE1;
    border-top-left-radius: 12px;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 15%);
  }
  .message.followup {
    margin-top: 3px;
  }

  /** Speech bubble arrow */
  .message:not(.followup) .bubble::before {
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
    border-color: #CDECE1 transparent transparent transparent;
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
    min-width: 32px;
    min-height: 32px;
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

  .text :global(blockquote) {
    border-left: 3px solid grey;
    padding-left: 16px;
    margin-left: 0px;
  }

  .reactions {
    z-index: 1;
    align-self: flex-end;
    margin-top: -6px;
    margin-right: 16px;
    padding: 0px 4px;
    border: 2px solid transparent;
    border-radius: 20px;
    background-color: white;
    box-shadow: 1px 1px 2px 0px rgba(0, 0, 0, 10%);
  }
  .outgoing .reactions {
    background-color: white;
  }

  .outgoing[deliveryStatus=sending] {
    opacity: 70%;
  }
</style>
