{#if message.sent.getDate() != previousMessage?.sent.getDate() }
  <hbox class="date-separator font-small">
    {longDayFormat.format(message.sent)}
  </hbox>
{/if}

<script lang="ts">
  import type { Message } from "../../../logic/Abstract/Message";

  export let message: Message;
  export let previousMessage: Message = null;

  const longDayFormat = Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
</script>

<style>
  .date-separator {
    width: 40%;
    align-self: center;
    justify-content: center;
    margin: 20px 20px 0px 20px;
    padding: 5px;
    color: var(--main-pattern-fg);
    opacity: 60%; /* TODO Should change only text color */
  }
</style>
