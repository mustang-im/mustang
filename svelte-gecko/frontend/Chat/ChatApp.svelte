<hbox flex class="chat app">
  <vbox class="left-pane">
    <PersonsList persons={chatRoomsSorted} bind:selected={selectedChat} />
  </vbox>
  <vbox class="right-pane">
    {#if messages && selectedChat }
      <Header person={selectedChat.contact} />
      <vbox flex class="messages">
          <MessageList {messages} />
      </vbox>
      <vbox class="editor">
        <MsgEditor to={selectedChat} />
      </vbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { appGlobal } from "../../logic/app";
  import { mergeColls } from "svelte-collections";
  import PersonsList from "../Shared/Person/PersonsList.svelte";
  import Header from "./PersonHeader.svelte";
  import MessageList from "./MessageView/MessageList.svelte";
  import MsgEditor from "./MsgEditor.svelte";

  let selectedChat: Chat;
  let chatRooms = mergeColls(appGlobal.chatAccounts.map(a => a.chats));
  $: chatRoomsSorted = $chatRooms.sortBy(chat => -chat.lastMessage?.sent);
  $: messages = selectedChat?.messages;
</script>

<style>
  .left-pane {
    flex: 1 0 0;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    max-width: 20em;
    background-color: #F9F9FD;
  }
  .right-pane {
    flex: 2 0 0;
  }
  .messages {
    background-color: #F9F9FD;
  }
  .editor {
    height: 96px;
  }
</style>
