<vbox flex class="message-display"
  on:keydown={event => catchErrors(() => onKeyOnList(event))}
  tabindex={0}
  >
  <Scroll>
    <MessageHeader bind:message />
    <MessageAttachments {message} />
    {#if $message.event || $message.invitationMessage}
      <InvitationInMail {message} />
    {/if}
    <vbox class="body" flex>
      <Paper>
        <MessageBody {message} />
      </Paper>
    </vbox>
  </Scroll>
  {#if $appGlobal.isMobile}
    <MessageDisplayBarM bind:message />
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { onKeyOnList } from "./MessageKeyboard";
  import { appGlobal } from "../../../logic/app";
  import MessageHeader from "./MessageHeader.svelte";
  import MessageAttachments from "./AttachmentsUI.svelte";
  import MessageBody from "./MessageBody.svelte";
  import InvitationInMail from "../../Calendar/DisplayEvent/InvitationInMail.svelte";
  import MessageDisplayBarM from "./MessageDisplayBarM.svelte";
  import Paper from "../../Shared/Paper.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
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
  @media (max-width: 600px)  {
    .body {
      margin-inline-start: 4px;
      margin-inline-end: 1px;
      margin-block-end: 1px;
    }
  }
</style>
