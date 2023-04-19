<vbox class="message mine">
  {@html message.html }
</vbox>

<script lang="ts">
  import type { ChatMessage } from "../../../logic/Chat/Message";

  export let message: ChatMessage;
</script>

<style>
  .message {
    flex: 1 0 0;
    justify-content: end;
  }
</style>
