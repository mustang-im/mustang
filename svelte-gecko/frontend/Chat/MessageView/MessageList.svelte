<vbox class="messages">
  <Scroll>
    {#each $sortedMessages.each as message}
      {#if message.outgoing}
        <MessageMine {message} />
      {:else}
      <MessageIncoming {message} />
      {/if}
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ChatMessage } from "../../../logic/Chat/Message";
  import MessageIncoming from "./MessageIncoming.svelte";
  import MessageMine from "./MessageMine.svelte";
  import Scroll from "../../Shared/Scroll.svelte";

  export let messages: Collection<ChatMessage>;

  $: sortedMessages = messages.sortBy(msg => msg.sent);
</script>

<style>
  .messages {
    flex: 1 0 0;
  }
</style>
