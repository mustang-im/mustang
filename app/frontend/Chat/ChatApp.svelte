<Splitter name="persons-list" initialRightRatio={4}>
  <vbox class="left-pane" slot="left">
    <Header />
    <PersonsList {chatRooms} bind:selectedChat />
  </vbox>
  <vbox class="right-pane" slot="right">
    {#if messages && selectedChat }
      <PersonHeader person={selectedChat.contact} />
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
  import { Person } from "../../logic/Abstract/Person";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import { ChatRoomEvent } from "../../logic/Chat/RoomEvent";
  import { selectedPerson } from "../Shared/Person/Selected";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import MessageList from "./MessageView/MessageList.svelte";
  import Message from "./MessageView/Message.svelte";
  import ChatRoomEventUI from "./MessageView/ChatRoomEventUI.svelte";
  import MsgEditor from "./MsgEditor.svelte";
  import Header from "./Header.svelte";
  import PersonHeader from "./PersonHeader.svelte";
  import PersonsList from "./PersonsList.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { catchErrors } from "../Util/error";
  import { mergeColls } from "svelte-collections";
  import { onMount } from "svelte";

  let selectedChat: Chat;
  let chatRooms = mergeColls(appGlobal.chatAccounts.map(a => a.chats));
  $: messages = $globalSearchTerm
    ? selectedChat?.messages.filter(msg => msg.text?.toLowerCase().includes($globalSearchTerm))
    : selectedChat?.messages;

  $: selectedChat && catchErrors(loadMessages)
  async function loadMessages() {
    await selectedChat.listMembers();
    await selectedChat.listMessages();
  }

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
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .messages {
    background: url(../asset/background-repeat.png) repeat;
    background-color: var(--main-pattern-bg);
    background-blend-mode: soft-light;
    color: var(--main-pattern-fg);
  }
  .editor {
    height: 112px;
  }
</style>
