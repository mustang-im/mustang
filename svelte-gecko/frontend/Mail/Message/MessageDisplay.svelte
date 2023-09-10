<vbox flex class="message-display">
  <MessageHeader {message} />
  <MessageBody {message} />
</vbox>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import MessageHeader from "../MessageHeader/MessageHeader.svelte";
  import MessageBody from "./MessageBody.svelte";

  export let message: Email;
</script>

<style>
</style>
