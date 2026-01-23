<vbox flex class="pane">
  {#if messages && room }
    <PersonHeader person={room.contact} />
    <vbox flex class="messages">
      <MessageList {messages}>
        <svelte:fragment slot="message" let:message let:previousMessage>
          {#if message instanceof UserChatMessage }
            <Message {message} {previousMessage} hideHeaderFollowup={true} />
          {:else if message instanceof ChatRoomEvent}
            <RoomEventUI {message} />
          {/if}
          </svelte:fragment>
      </MessageList>
    </vbox>
    <vbox class="editor">
      <MsgEditor to={room} />
    </vbox>
  {/if}
</vbox>
{#if $appGlobal.isMobile}
  <RoomBarM />
{/if}

<script lang="ts">
  import { ChatRoom } from "../../logic/Chat/ChatRoom";
  import { UserChatMessage } from "../../logic/Chat/Message";
  import { ChatRoomEvent } from "../../logic/Chat/RoomEvent";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import MessageList from "./MessageView/MessageList.svelte";
  import Message from "./MessageView/Message.svelte";
  import RoomEventUI from "./MessageView/RoomEventUI.svelte";
  import MsgEditor from "./MsgEditor.svelte";
  import PersonHeader from "./PersonHeader.svelte";
  import RoomBarM from "./RoomBarM.svelte";
  import { catchErrors } from "../Util/error";

  export let room: ChatRoom;

  $: messages = $globalSearchTerm
    ? room?.messages.filterObservable(msg => msg.text?.toLowerCase().includes($globalSearchTerm))
    : room?.messages;

  $: room && catchErrors(loadMessages)
  async function loadMessages() {
    await room?.listMembers();
    await room?.listMessages();
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
