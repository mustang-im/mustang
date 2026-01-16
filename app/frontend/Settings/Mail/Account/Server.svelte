<vbox>
  <h2>{$t`Server`}</h2>
  <hbox class="subtitle">{$t`Your email provider or company can tell you these details.`}</hbox>

  <ManualConfig config={mailAccount} stepFull={true} />

  {#if account instanceof IMAPAccount}
    <ServerIMAPAdvanced {account} />
  {/if}
</vbox>

<script lang="ts">
  import type { Account } from "../../../../logic/Abstract/Account";
  import type { MailAccount } from "../../../../logic/Mail/MailAccount";
  import { IMAPAccount } from "../../../../logic/Mail/IMAP/IMAPAccount";
  import { catchErrors } from "../../../Util/error";
  import ManualConfig from "../Manual/ManualConfig.svelte";
  import ServerIMAPAdvanced from "./ServerIMAPAdvanced.svelte";
  import { t } from "../../../../l10n/l10n";

  export let account: Account;

  $: mailAccount = account as MailAccount;

  $: $account, catchErrors(save);
  async function save() {
    await mailAccount.save();
  }
</script>

<style>
  h2 {
    margin-block-start: 0px;
    margin-block-end: 0px;
  }
</style>
