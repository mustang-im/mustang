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

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";

  export let message: ChatMessage;
</script>

<style>
  .subject {
    font-weight: bold;
  }
  .subject,
  .body {
    max-height: 1.5em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
