<ManualConfig config={mailAccount} stepFull={true} />

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import ManualConfig from "../Setup/Mail/manual/ManualConfig.svelte";

  export let account: Account;

  $: mailAccount = account as MailAccount;
</script>
