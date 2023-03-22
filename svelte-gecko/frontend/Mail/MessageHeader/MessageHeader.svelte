<vbox class="message-header">
  <hbox>
    <label control="msg-subject">Subject</label>
    <value id="msg-subject">{message.subject}</value>
  </hbox>
  <hbox>
    <label control="msg-from">From</label>
    <value id="msg-from">{message.authorRealname}</value>
  </hbox>
  <hbox>
    <label control="msg-date">Date</label>
    <value id="msg-date">{getDateString(message.date)}</value>
  </hbox>
</vbox>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import { getDateString } from "../../Util/date";

  export let message: Email;
</script>

<style>
  .message-header {
    min-height: 5em;
    border-bottom: 1px solid grey;
  }
</style>
