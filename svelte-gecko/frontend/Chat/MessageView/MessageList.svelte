<vbox flex class="background">
  <Scroll bind:this={scroller}>
    <vbox class="messages">
      {#each $sortedMessages.each as message, i}
        <DateSeparator {message} previousMessage={sortedMessages.getIndex(i - 1)} />
        {#if message instanceof UserChatMessage || message instanceof EMail}
          <Message {message} previousMessage={sortedMessages.getIndex(i - 1)} />
        {:else if message instanceof ChatRoomEvent}
          <ChatRoomEventUI {message} />
        {/if}
      {/each}
    </vbox>
  </Scroll>
</vbox>

<script lang="ts">
  import { UserChatMessage, type ChatMessage } from "../../../logic/Chat/Message";
  import { ChatRoomEvent } from "../../../logic/Chat/RoomEvent";
  import { EMail } from "../../../logic/Mail/Message";
  import Message from "./Message.svelte";
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
.background {
  background: url(../../asset/background-repeat.png) repeat;
  background-color: #E6F2F1;
  box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%) inset;
}
</style>
