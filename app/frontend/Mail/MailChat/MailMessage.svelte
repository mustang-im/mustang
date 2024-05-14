<MessageBubble {message} {previousMessage}>
  <svelte:fragment slot="above-center">
    <hbox flex />
    <hbox class="recipients">
      to: {recipientsLine}
    </hbox>
  </svelte:fragment>
  <svelte:fragment slot="inner-top">
    {#if !(previousMessage instanceof EMail && message.subject == previousMessage.subject)}
      <h2 class="subject">
        {$message.subject}
      </h2>
    {/if}
  </svelte:fragment>
</MessageBubble>

<script lang="ts">
  import type { Message } from "../../../logic/Abstract/Message";
  import { EMail } from "../../../logic/Mail/EMail";
  import MessageBubble from "../../Chat/MessageView/Message.svelte";

  export let message: EMail;
  export let previousMessage: Message;

  $: allRecipients = message.to.concat(message.cc).concat(message.bcc);
  $: recipientsLine = allRecipients.contents.map(person => person.name).join(", ");
</script>

<style>
  .subject {
    font-weight: bold;
    font-size: 13px;
    line-height: normal;
    margin: 8px 0 4px 0;
  }
  .recipients {
    overflow: hidden;
    max-width: 75%;
    margin: 0 12px;
    max-height: 1.5em;
  }
</style>
