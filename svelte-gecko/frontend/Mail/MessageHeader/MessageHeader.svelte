<vbox class="message-header">
  <hbox>
    <label control="msg-subject">Subject</label>
    <value id="msg-subject">{message.subject}</value>
  </hbox>
  <hbox>
    <label control="msg-from">From</label>
    <value id="msg-from">{from}</value>
  </hbox>
  <hbox>
    <label control="msg-from">To</label>
    <value id="msg-from">{to}</value>
  </hbox>
  <hbox>
    <label control="msg-date">Date</label>
    <value id="msg-date">{getDateString(message.received)}</value>
  </hbox>
</vbox>

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
  }
</style>
