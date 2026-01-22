<vbox class="chat-rooms" flex>
  <PersonsList persons={chatRooms} bind:selected={selectedChat} {doSearch}
    sortBy={chat => -chat.lastMessage?.sent}>
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
</vbox>

<script lang="ts">
  import { Chat } from "../../logic/Chat/Chat";
  import PersonsList from "../Contacts/Person/PersonsList.svelte";
  import { getDateTimeString } from "../Util/date";
  import type { Collection } from "svelte-collections";

  export let chatRooms: Collection<Chat>;
  export let selectedChat: Chat;
  export let doSearch = false;
</script>

<style>
  .chat-rooms :global(.first-row) {
    margin-block-start: 3px;
  }
  .chat-rooms :global(.person .name) {
    font-size: medium;
  }
  .last-time {
    opacity: 50%;
    font-size: x-small;
    margin-block-start: 3px;
    margin-inline-start: 8px;
  }
  .last-msg {
    opacity: 50%;
    margin-inline-start: 1px;
    margin-block-end: 2px;
    max-height: 1.8em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
