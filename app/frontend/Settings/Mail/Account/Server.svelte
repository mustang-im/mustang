<vbox>
  <h2>{$t`Server`}</h2>
  <hbox class="subtitle">{$t`Your email provider or company can tell you these details.`}</hbox>

  <ManualConfig config={mailAccount} stepFull={true} />
</vbox>


<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { SQLMailAccount } from "../../../../logic/Mail/SQL/SQLMailAccount";
  import { catchErrors } from "../../../Util/error";
  import ManualConfig from "../../Setup/Mail/manual/ManualConfig.svelte";
  import { t } from "svelte-i18n-lingui";

  export let account: Account;

  $: mailAccount = account as MailAccount;

  $: $account, catchErrors(save);
  async function save() {
    await SQLMailAccount.save(mailAccount);
  }
</script>

<style>
  h2 {
    margin-top: 0px;
    margin-bottom: 0px;
  }
</style>
