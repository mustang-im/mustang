<vbox flex class="messages">
  <Scroll bind:this={scroller}>
    {#each $sortedMessages.each as message, i}
      <Message {message} previousMessage={sortedMessages.getIndex(i - 1)} />
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { ChatMessage } from "../../../logic/Chat/Message";
  import Message from "./Message.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { tick } from "svelte";

  export let messages: Collection<ChatMessage>;

  $: sortedMessages = messages.sortBy(msg => msg.sent);

  let scroller: Scroll;
  $: $messages && scroller && scrollDown();
  async function scrollDown() {
    await tick(); // wait for message to be added to HTML
    scroller.scrollDown();
  }
</script>

<style>
.messages {
  background: url(background-repeat.png) repeat;
  background-color: #EEEEEE;
}
</style>
