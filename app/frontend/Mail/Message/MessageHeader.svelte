<vbox class="message-header" class:outgoing={$message.outgoing}>
  <value class="subject">{$message.subject}</value>
  <hbox>
    {#if message.contact instanceof Person}
      <PersonPicture person={$message.contact} />
    {/if}
    <vbox>
      <value class="from" title={$message.authorEmailAddress}>
        {from}
      </value>
      {#if $message.to.hasItems}
        <hbox class="to">
          to&nbsp;
          <RecipientList recipients={$message.to} />
        </hbox>
      {/if}
      {#if $message.cc.hasItems}
        <hbox class="cc">
          cc&nbsp;
          <RecipientList recipients={$message.cc} />
        </hbox>
      {/if}
      {#if $message.bcc.hasItems}
        <hbox class="bcc">
          bcc&nbsp;
          <RecipientList recipients={$message.bcc} />
        </hbox>
      {/if}
    </vbox>
    <hbox flex />
    <vbox>
      <MessageToolbar {message} {account} />
      <value class="date" title={$message.received?.toLocaleString()}>
        {getDateString($message.received)}
      </value>
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  //import type { Email } from "mustang-lib";
  import type { EMail } from "../../../logic/Mail/Message";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import { Person } from "../../../logic/Abstract/Person";
  import MessageToolbar from "./MessageToolbar.svelte";
  import RecipientList from "./RecipientList.svelte";
  import PersonPicture from "../../Shared/Person/PersonPicture.svelte";
  import { getDateString } from "../../Util/date";
  import { onDestroy } from "svelte";

  export let message: EMail;
  export let account: MailAccount;

  $: from = message.outgoing
    ? "me"
    : message.contact?.name
      ?? message.authorEmailAddress;

  $: markMessageAsRead(message);
  let readTimeout: NodeJS.Timeout;
  const readDelay = 3; // seconds, 0 to 30
  function markMessageAsRead(message: EMail) {
    clearTimeout(readTimeout);
    readTimeout = setTimeout(() => {
      message.read = true;
    }, readDelay * 1000);
  }
  onDestroy(() => {
    clearTimeout(readTimeout);
  });
</script>

<style>
  .message-header {
    min-height: 5em;
    padding: 16px 20px 8px 20px;
    background-color: #F9F9FD;
    box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 5%), 0px -1px 5px 0px rgba(0, 0, 0, 8%);
    z-index: 1;
  }
  .subject {
    font-weight: 700;
    margin-bottom: 8px;
  }
  .from {
    font-weight: bold;
  }
  .outgoing .from {
    font-weight: normal;
    color: grey;
  }
  .to {
    font-size: 13px;
    color: grey;
  }
  .cc, .bcc {
    font-size: 13px;
    color: grey;
  }
  .outgoing .to {
    font-weight: bold;
    color: inherit;
  }
  .date {
    align-self: end;
  }
</style>
