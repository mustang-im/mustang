<hbox flex class="chat app">
  <vbox class="left-pane">
    <PersonsList {chatRooms} bind:selected={selectedChat} />
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
  import type { Collection } from "svelte-collections";
  import PersonsList from "./PersonsList.svelte";
  import Header from "./PersonHeader.svelte";
  import MessageList from "./MessageView/MessageList.svelte";
  import MsgEditor from "./MsgEditor.svelte";

  export let chatRooms: Collection<Chat>;

  let  selectedChat: Chat;
  $: messages = selectedChat?.messages;
</script>

<style>
  .left-pane {
    flex: 1 0 0;
  }
  .right-pane {
    flex: 2 0 0;
  }
  .messages {
    background-color: #F3F3F3;
  }
  .editor {
    height: 96px;
  }
</style>
