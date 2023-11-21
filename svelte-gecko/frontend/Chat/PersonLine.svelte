<hbox flex class="person">
  <vbox class="image">
    <img
      src={chatRoom.contact.picture}
      width="64" height="64"
      title="Picture of {chatRoom.contact.name}"
      alt="" />
  </vbox>
  <vbox flex class="right">
    <hbox class="right-top">
      <hbox flex class="name">{chatRoom.name}</hbox>
      {#if lastMessage}
        <hbox class="last-time">{getDateString(lastMessage.sent)}</hbox>
      {/if}
    </hbox>
    {#if lastMessage}
      <hbox flex class="last-msg">{lastMessage.text.substring(0, 50)}</hbox>
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type { Chat } from "../../logic/Chat/Chat";
  import { getDateString } from "../Util/date";

  export let chatRoom: Chat;
  $: lastMessage = chatRoom.lastMessage;
</script>

<style>
  .image {
    width: 56px;
    height: 56px;
    margin: 7px;
    margin-left: 12px;
    clip-path: circle();
  }
  .right {
    margin-top: 0px;
    padding: 10px;
  }
  .name {
    font-size: 14px;
  }
  .last-time {
    opacity: 50%;
    font-size: x-small;
    margin-top: 3px;
  }
  .last-msg {
    opacity: 50%;
    margin-top: 0px;
    font-size: 11.5px;
    max-height: 1.8em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
