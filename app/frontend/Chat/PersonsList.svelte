<PersonsList persons={chatRoomsSorted} bind:selected={selectedChat} pictureSize={32}>
  <hbox slot="top-right" class="last-time" let:person={chatRoom}>
    {#if chatRoom instanceof Chat && chatRoom.lastMessage}
      {getDateTimeString(chatRoom.lastMessage.sent)}
    {/if}
  </hbox>
  <hbox slot="second-row" flex class="last-msg font-smallest" let:person={chatRoom}>
    {#if chatRoom instanceof Chat && chatRoom.lastMessage}
      {chatRoom.lastMessage.text?.substring(0, 50)}
    {/if}
  </hbox>
</PersonsList>

<script lang="ts">
  import { Chat } from "../../logic/Chat/Chat";
  import type { Collection } from "svelte-collections";
  import PersonsList from "../Contacts/Person/PersonsList.svelte";
  import { getDateTimeString } from "../Util/date";

  export let chatRooms: Collection<Chat>;
  export let selectedChat: Chat;

  $: chatRoomsSorted = $chatRooms.sortBy(chat => -chat.lastMessage?.sent);
</script>

<style>
  .last-time {
    opacity: 50%;
    font-size: x-small;
    margin-block-start: 3px;
  }
  .last-msg {
    opacity: 50%;
    margin-block-start: 5px;
    max-height: 1.8em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
