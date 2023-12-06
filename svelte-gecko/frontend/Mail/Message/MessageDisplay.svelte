<vbox flex class="message-display">
  <MessageHeader {message} {account} />
  <MessageBody {message} />
</vbox>

<script lang="ts">
  import type { Email } from "mustang-lib";
  import type { MailAccount } from "../../../logic/Mail/Account";
  import MessageHeader from "./MessageHeader.svelte";
  import MessageBody from "./MessageBody.svelte";

  export let message: Email;
  export let account: MailAccount;
</script>

<style>
</style>
