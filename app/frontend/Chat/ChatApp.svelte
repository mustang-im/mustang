<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <PersonsList {chatRooms} bind:selectedChat />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if messages && selectedChat }
      <Header person={selectedChat.contact} />
      <vbox flex class="messages">
        <MessageList {messages}>
          <svelte:fragment slot="message" let:message let:previousMessage>
            {#if message instanceof UserChatMessage }
              <Message {message} {previousMessage} hideHeaderFollowup={true} />
            {:else if message instanceof ChatRoomEvent}
              <ChatRoomEventUI {message} />
            {/if}
            </svelte:fragment>
        </MessageList>
      </vbox>
      <vbox class="editor">
        <MsgEditor to={selectedChat} />
      </vbox>
    {/if}
  </vbox>
</Splitter>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { appGlobal } from "../../logic/app";
  import { mergeColls } from "svelte-collections";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import { ChatRoomEvent } from "../../logic/Chat/RoomEvent";
  import { selectedPerson } from "../Shared/Person/PersonOrGroup";
  import PersonsList from "./PersonsList.svelte";
  import Header from "./PersonHeader.svelte";
  import MessageList from "./MessageView/MessageList.svelte";
  import Message from "./MessageView/Message.svelte";
  import ChatRoomEventUI from "./MessageView/ChatRoomEventUI.svelte";
  import MsgEditor from "./MsgEditor.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { onMount } from "svelte";
  import { Person } from "../../logic/Abstract/Person";

  let selectedChat: Chat;
  let chatRooms = mergeColls(appGlobal.chatAccounts.map(a => a.chats));
  $: messages = selectedChat?.messages;

  onMount(() => {
    selectedChat = $selectedPerson && chatRooms.find(chat => chat.contact == $selectedPerson);
  });
  $: if (selectedChat?.contact instanceof Person) {
    $selectedPerson = selectedChat.contact;
  }
</script>

<style>
  .left-pane {
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on MessageList */
    background-color: #F9F9FD;
  }
  .messages {
    background-color: #F9F9FD;
  }
  .editor {
    height: 112px;
  }
</style>
