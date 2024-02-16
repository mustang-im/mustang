<vbox flex class="message-display">
  <MessageHeader {message} {account} />
  <MessageBody {message} />
</vbox>

<script lang="ts">
  import type MailAccount from "../../../../lib/logic/mail/MailAccount";
  import type EMail from "../../../../lib/logic/mail/EMail";
  import MessageHeader from "./MessageHeader.svelte";
  import MessageBody from "./MessageBody.svelte";

  export let message: EMail;
  export let account: MailAccount;
</script>

<style>
</style>
