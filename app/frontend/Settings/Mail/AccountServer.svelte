<grid>
  <label for="hostname">Server</label>
  <hbox class="value">{mailAccount.hostname}:{mailAccount.port}</hbox>
  <label for="username">Username</label>
  <hbox class="value">{mailAccount.username}</hbox>
</grid>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";

  export let account: Account;

  $: mailAccount = account as MailAccount;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
