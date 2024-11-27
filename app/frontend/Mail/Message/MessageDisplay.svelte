<vbox flex class="message-display">
  <MessageHeader {message} />
  <MessageAttachments {message} />
  {#if $message.event || $message.scheduling}
    <Invitation {message} />
  {/if}
  <Paper>
    <MessageBody {message} />
  </Paper>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import MessageHeader from "./MessageHeader.svelte";
  import MessageAttachments from "./AttachmentsUI.svelte";
  import MessageBody from "./MessageBody.svelte";
  import Invitation from "../../Calendar/Invitation.svelte";
  import Paper from "../../Shared/Paper.svelte";

  export let message: EMail;
</script>

<style>
.message-display {
  background-color: var(--leftbar-bg);
  color: var(--leftbar-fg);
}
</style>
