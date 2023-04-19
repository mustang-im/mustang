<vbox class="message mine">
  {@html message.html }
</vbox>

<script lang="ts">
  import type { Message } from "../../../logic/Message";

  export let message: Message;
</script>

<style>
  .message {
    flex: 1 0 0;
    justify-content: end;
  }
</style>
