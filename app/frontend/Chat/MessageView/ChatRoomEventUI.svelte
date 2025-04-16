<hbox flex
  class="chatroomevent"
  class:incoming={!message.outgoing}
  class:outgoing={message.outgoing}
  >
  <vbox class="right">
    <hbox class="text selectable font-smallest">{@html message.html }</hbox>
  </vbox>
</hbox>

<script lang="ts">
  import type { ChatRoomEvent } from "../../../logic/Chat/RoomEvent";

  export let message: ChatRoomEvent;
</script>

<style>
  .chatroomevent {
    margin: 8px 32px 0 20px;
    color: black;
  }
  .incoming {
    align-self: flex-start;
  }
  .outgoing {
    align-self: flex-end;
  }

  .text {
  }
  .text :global(.person) {
    color: blue;
  }
</style>
