<vbox flex class="messages">
  <Scroll bind:this={scroller}>
    {#each $sortedMessages.each as message, i}
      <DateSeparator {message} previousMessage={sortedMessages.getIndex(i - 1)} />
      {#if message instanceof UserChatMessage}
        <Message {message} previousMessage={sortedMessages.getIndex(i - 1)} />
      {:else if message instanceof ChatRoomEvent}
        <ChatRoomEventUI {message} />
      {/if}
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import { UserChatMessage, type ChatMessage } from "../../../logic/Chat/Message";
  import Message from "./Message.svelte";
  import { ChatRoomEvent } from "../../../logic/Chat/RoomEvent";
  import ChatRoomEventUI from "./ChatRoomEventUI.svelte";
  import DateSeparator from "./DateSeparator.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import type { Collection } from "svelte-collections";
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
  background: url(../../asset/background-repeat.png) repeat;
  background-color: #EEEEEE;
}
</style>
