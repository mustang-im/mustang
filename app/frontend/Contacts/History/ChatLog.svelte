<Clickable onClick={onOpen}>
  <vbox>
    {#if message.subject}
      <div class="subject">
        {message.subject}
      </div>
    {/if}
    <div class="body">
      {message.text?.substring(0, 120)}
    </div>
  </vbox>
</Clickable>

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";
  import Clickable from "../../Shared/Clickable.svelte";

  export let message: ChatMessage;

  function onOpen() {
    // openChatFromOtherApp(message.chat); // TODO message.chat doesn't exist
  }
</script>

<style>
  .subject,
  .body {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subject {
    max-height: 1.2em;
    margin-block-start: -1px;
    margin-block-end: 6px;
    font-weight: bold;
  }
  .body {
    max-height: 2.4em;
    font-weight: 300;
    line-height: 1.2em;
  }
</style>
