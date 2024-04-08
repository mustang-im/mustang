<vbox flex class="mail-account">
  <grid>
    <label for="realname">Your name</label>
    <input type="value" bind:value={account.userRealname} name="realname" />
  </grid>
</vbox>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";

  export let account: Account;

  $: mailAccount = account as MailAccount;
</script>

<style>
  grid {
    grid-template-columns: max-content auto;
    margin: 32px;
    gap: 8px 24px;
  }
</style>
