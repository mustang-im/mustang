<ManualConfig config={mailAccount} stepFull={true} />

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { SQLMailAccount } from "../../../logic/Mail/SQL/SQLMailAccount";
  import { catchErrors } from "../../Util/error";
  import ManualConfig from "../Setup/Mail/manual/ManualConfig.svelte";

  export let account: Account;

  $: mailAccount = account as MailAccount;

  $: $account, catchErrors(save);
  async function save() {
    await SQLMailAccount.save(mailAccount);
  }
</script>
