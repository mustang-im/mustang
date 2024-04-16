<grid>
  <label for="realname">Your name</label>
  <input type="text" bind:value={account.userRealname} name="realname" />
  <label for="emailaddress">Your email address</label>
  <input type="email" bind:value={mailAccount.emailAddress} name="emailaddress" />
</grid>

<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";

  export let account: Account;

  $: mailAccount = account as MailAccount;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    gap: 8px 24px;
  }
</style>
