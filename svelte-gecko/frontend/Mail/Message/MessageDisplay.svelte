<vbox class="message-display">
  <MessageHeader {message} />
  <MessageBody {message} />
</vbox>

<script lang="ts">
  import MessageHeader from "../MessageHeader/MessageHeader.svelte";
  import MessageBody from "./MessageBody.svelte";

  export let message: Email;
</script>

<style>
  .message-display {
    flex: 1 0 0;
  }
</style>
