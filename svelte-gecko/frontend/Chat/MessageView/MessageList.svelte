<vbox class="messages">
  <Scroll>
    {#each $sortedMessages.each as message}
      <Message {message} />
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ChatMessage } from "../../../logic/Chat/Message";
  import Message from "./Message.svelte";
  import Scroll from "../../Shared/Scroll.svelte";

  export let messages: Collection<ChatMessage>;

  $: sortedMessages = messages.sortBy(msg => msg.sent);
</script>

<style>
  .messages {
    flex: 1 0 0;
    background-color: #F3F3F3;
  }
</style>
