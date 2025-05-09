<vbox flex class="message-display"
  on:keydown={event => catchErrors(() => onKeyOnList(event))}
  tabindex={0}
  >
  <MessageHeader {message} />
  <MessageAttachments {message} />
  {#if $message.event || $message.invitationMessage}
    <Invitation {message} />
  {/if}
  <vbox class="body" flex>
    <Paper>
      <MessageBody {message} />
    </Paper>
  </vbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { onKeyOnList } from "./MessageKeyboard";
  import MessageHeader from "./MessageHeader.svelte";
  import MessageAttachments from "./AttachmentsUI.svelte";
  import MessageBody from "./MessageBody.svelte";
  import Invitation from "../../Calendar/DisplayEvent/Invitation.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;
</script>

<style>
  .message-display {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .body {
    margin-inline-start: 8px;
    margin-block-end: 2px;
  }
</style>
