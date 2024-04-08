<vbox flex class="mail-account">
  <Scroll>
    <grid>
      <label for="name">Account name</label>
      <input type="value" bind:value={account.name} name="name" />
    </grid>
  </Scroll>
</vbox>

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Scroll from "../../Shared/Scroll.svelte";

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
