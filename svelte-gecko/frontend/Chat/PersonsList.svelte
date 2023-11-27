<vbox flex class="persons">
  <Scroll>
    {#each $chatRoomsSorted.each as chatRoom}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <vbox class="person" class:selected={chatRoom == selected} on:click={() => selected = chatRoom}>
        <PersonLine chatRoom={chatRoom} />
      </vbox>
    {/each}
  </Scroll>
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Chat } from "../../logic/Chat/Chat";
  import PersonLine from "./PersonLine.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  export let chatRooms: Collection<Chat>;
  export let selected: Chat = null;

  $: chatRoomsSorted = $chatRooms.sortBy(chat => -chat.lastMessage?.sent);
</script>

<style>
  .person {
    border-right: 1px dotted lightgray;
  }
  .person.selected {
    background-color: #20AE9E;
    color: white;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%);
  }
</style>
