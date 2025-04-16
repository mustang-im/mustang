<vbox flex class="pane">
  {#if messages && chat }
    <PersonHeader person={chat.contact} />
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
      <MsgEditor to={chat} />
    </vbox>
  {/if}
</vbox>
<ChatBarM />

<script lang="ts">
  import { Chat } from "../../logic/Chat/Chat";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import { ChatRoomEvent } from "../../logic/Chat/RoomEvent";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import MessageList from "./MessageView/MessageList.svelte";
  import Message from "./MessageView/Message.svelte";
  import ChatRoomEventUI from "./MessageView/ChatRoomEventUI.svelte";
  import MsgEditor from "./MsgEditor.svelte";
  import PersonHeader from "./PersonHeader.svelte";
  import ChatBarM from "./ChatBarM.svelte";
  import { catchErrors } from "../Util/error";

  export let chat: Chat;

  $: messages = $globalSearchTerm
    ? chat?.messages.filter(msg => msg.text?.toLowerCase().includes($globalSearchTerm))
    : chat?.messages;

  $: chat && catchErrors(loadMessages)
  async function loadMessages() {
    await chat?.listMembers();
    await chat?.listMessages();
  }
</script>

<style>
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
