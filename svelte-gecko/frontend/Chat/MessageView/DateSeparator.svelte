{#if message.sent.getDate() != previousMessage?.sent.getDate() }
  <hbox class="date-separator">
    {longDayFormat.format(message.sent)}
  </hbox>
{/if}

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";

  export let message: ChatMessage;
  export let previousMessage: ChatMessage = null;

  const longDayFormat = Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
</script>

<style>
  .date-separator {
    width: 50%;
    align-self: center;
    justify-content: center;
    margin: 20px 20px 0px 20px;
    padding: 5px;
    font-size: small;
    color: #999999;
    border-top: 1px dotted lightgray;
  }
</style>
