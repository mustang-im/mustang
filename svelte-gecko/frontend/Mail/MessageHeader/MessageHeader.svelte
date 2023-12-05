<grid class="message-header">
  <hbox class="label">Subject</hbox>
  <value id="msg-subject">{message.subject}</value>
  <hbox class="label">From</hbox>
  <value id="msg-from">{from}</value>
  <hbox class="label">To</hbox>
  <value id="msg-from">{to}</value>
  <hbox class="label">Date</hbox>
  <value id="msg-date">{getDateString(message.received)}</value>
</grid>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import { getDateString } from "../../Util/date";

  export let message: Email;

  $: from = message.outgoing
    ? message.authorEmailAddress
    : message.contact?.name
      ?? message.authorEmailAddress;
  $: to = message.outgoing
    ? message.contact?.name
      ?? message.recipientEmailAddress
    : message.recipientEmailAddress;
</script>

<style>
  .message-header {
    min-height: 5em;
    border-bottom: 1px solid grey;
    padding: 8px 16px;
  }
  grid.message-header {
    grid-template-columns: auto 1fr;
  }
  .label {
    margin-right: 16px;
  }
</style>
